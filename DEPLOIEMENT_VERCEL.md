# Déploiement sur Vercel + Neon

Ce projet est configuré en **un seul projet Vercel**, avec la fonctionnalité
[Vercel Services](https://vercel.com/docs/services) : le frontend (React/Vite)
et l'API (Fastify) sont déclarés comme deux services dans `vercel.json` à la
racine du dépôt, déployés ensemble sur le même domaine. Le front appelle
l'API en URL relative (`/api/...`), donc pas de CORS à configurer côté client.

- Service `frontend` (racine `frontend/`) → build statique Vite, servi sur `/`
- Service `backend` (racine `backend/`) → Fastify natif (`backend/src/index.ts`),
  servi sur `/api/*`. Vercel déploie Fastify tel quel (zéro config) : le code
  appelle toujours `app.listen()` comme en développement, Vercel l'encapsule
  automatiquement en fonction serverless (Fluid Compute).
- Base de données → Postgres géré par [Neon](https://neon.tech)
- Uploads (logo, photos produits) → [Vercel Blob](https://vercel.com/storage/blob)

**Multi-tenant** : une seule base sert plusieurs restaurants, chacun isolé
par un `restaurantId`. À la connexion, l'utilisateur saisit un **code
établissement** (ex. `CHEZFATOU`) en plus de son identifiant/mot de passe.
Chaque nouveau restaurant est créé via le script `onboard-restaurant.ts`
(section 7 ci-dessous), pas via l'écran d'inscription (il n'y en a pas).

## 1. Créer la base sur Neon

1. Créer un compte / projet sur [neon.tech](https://neon.tech).
2. Dans le dashboard du projet → **Connect** : copier les **deux** chaînes de connexion :
   - **Pooled connection** (hôte qui se termine par `-pooler`) → ce sera `DATABASE_URL`
   - **Direct connection** (sans `-pooler`) → ce sera `DIRECT_URL`
3. Garder ces deux URLs de côté, elles vont dans les variables d'environnement Vercel (étape 3).

> Pourquoi deux URLs ? Neon fait passer les connexions applicatives par un
> pooler (PgBouncer), indispensable en serverless où chaque invocation peut
> ouvrir sa propre connexion. Mais `prisma db push` / `migrate` ne fonctionnent
> pas à travers un pooler : ils ont besoin de la connexion directe.

## 2. Créer le projet Vercel

1. Sur [vercel.com](https://vercel.com) → **Add New → Project** → importer le
   dépôt GitHub `CBlacks07/Gestion_Fast_Food`.
2. Vercel scanne le dépôt et propose un écran **Services** listant `frontend`
   (Vite) et `backend` (Fastify, monté sur `/api`) — c'est normal, le
   `vercel.json` du dépôt déclare exactement ces deux services.
3. **Root Directory** (champ en bas de l'écran d'import) : le laisser sur la
   **racine du dépôt**, PAS sur `backend`. Le `vercel.json` qui définit les
   deux services vit à la racine ; si Root Directory pointe sur `backend/`,
   Vercel ne le trouve pas et l'import échoue ou ignore le frontend. Cliquer
   sur **Edit** à côté de Root Directory et remettre `./` (ou vide) si un
   sous-dossier est pré-rempli.
4. Le panneau *"vercel.json required to deploy projects with multiple
   services"* doit refléter le fichier déjà présent dans le dépôt (clique sur
   **Refresh** s'il affiche encore une version générée automatiquement) —
   inutile de copier/coller un snippet manuellement.

## 3. Variables d'environnement (Vercel → Settings → Environment Variables)

| Variable | Valeur | Environnement |
|---|---|---|
| `DATABASE_URL` | chaîne **pooled** copiée depuis Neon | Production + Preview |
| `DIRECT_URL` | chaîne **directe** copiée depuis Neon | Production + Preview |
| `JWT_SECRET` | secret aléatoire ≥ 32 caractères (`openssl rand -base64 64`) | Production + Preview |
| `JWT_EXPIRES_IN` | `24h` | Production + Preview |
| `NODE_ENV` | `production` | Production |
| `BLOB_READ_WRITE_TOKEN` | voir étape 4 | Production + Preview |

`ALLOWED_ORIGINS` n'est pas nécessaire dans ce déploiement mono-projet
(front et API sur le même domaine → same-origin).

## 4. Activer Vercel Blob (stockage des images)

1. Dans le projet Vercel → **Storage** → **Create Database** → **Blob**.
2. Une fois créé, Vercel propose de connecter le store au projet : accepter
   → il injecte automatiquement `BLOB_READ_WRITE_TOKEN` dans les variables
   d'environnement (Production + Preview). Vérifier qu'elle apparaît bien
   dans la liste de l'étape 3.

## 5. Pousser le schéma sur Neon

### Cas A — nouvelle base Neon, vide

```bash
cd backend
# Remplacer temporairement DATABASE_URL et DIRECT_URL dans backend/.env
# par les valeurs Neon, puis :
npx prisma db push
npm run seed          # optionnel : restaurant de démo (code DEMO) + données de test
npm run onboard-restaurant -- --code=MONRESTO --name="Mon Restaurant" --admin-username=admin --admin-email=admin@exemple.com --with-default-categories
```

Remettre ensuite `backend/.env` sur les valeurs locales pour continuer à
développer contre la base Postgres locale.

### Cas B — base Neon déjà en production (déploiement mono-restaurant existant)

Si Neon contient déjà les données d'un restaurant unique (déploiement
antérieur au passage multi-tenant), **ne pas faire un simple `db push`** :
la colonne `restaurantId` est obligatoire dans le schéma actuel et les
lignes existantes n'en ont pas. Procédure (à faire une seule fois) :

```bash
cd backend
# .env pointé temporairement sur Neon (DIRECT_URL = connexion directe, pas pooled)

# 1. Vérifier qu'il n'y a pas deux clôtures pour la même date (la nouvelle
#    contrainte devient "une clôture par restaurant et par jour") :
#    SELECT date, COUNT(*) FROM daily_closures GROUP BY date HAVING COUNT(*) > 1;
#    S'il y en a, garder la plus récente (closedAt) et supprimer les autres.

# 2. Backfill : rattache toutes les lignes existantes à un restaurant n°1
npm run backfill-restaurant-1 -- --code=MONRESTO --name="Mon Restaurant"

# 3. Le schéma actuel du dépôt a déjà les contraintes resserrées :
npx prisma db push --accept-data-loss
```

Déployer le nouveau code (front + back) **immédiatement après** cette étape :
l'ancien code ne connaît pas `restaurantId` et échouera contre ce schéma.

## 6. Déployer

Un `git push` sur `main` (ou le déploiement manuel depuis le dashboard Vercel)
déclenche le build. Vercel construit chaque service indépendamment :
`npm install` (à la racine, via les workspaces npm) déclenche le `postinstall`
du backend (`prisma generate`) ; le service `frontend` build avec le preset
Vite standard, le service `backend` est bundlé tel quel comme fonction Fastify.

Vérifier ensuite :
- `https://<projet>.vercel.app/api/health` → `{"status":"ok","database":"connected"}`
- `https://<projet>.vercel.app/` → écran de connexion (3 champs : code
  établissement, identifiant, mot de passe)
- Connexion avec le code établissement + les identifiants créés à l'étape 5,
  upload d'une image de produit (doit renvoyer une URL
  `https://....public.blob.vercel-storage.com/...`)

## 7. Ajouter un nouveau restaurant client

```bash
cd backend
npm run onboard-restaurant -- --code=CHEZFATOU --name="Chez Fatou" \
  --admin-username=fatou --admin-email=fatou@exemple.com \
  --with-default-categories
```

Le script affiche le code établissement et les identifiants admin générés
(mot de passe aléatoire si `--admin-password` n'est pas fourni) — à
transmettre au client, avec la consigne de changer le mot de passe après la
première connexion. Peut être exécuté contre Neon (avec `DATABASE_URL`/
`DIRECT_URL` temporairement sur les valeurs de prod) ou en local pour tester.

## 8. Panneau superadmin (gestion de tous les restaurants)

Une zone séparée (`/admin`), avec sa propre authentification (aucun rapport
avec les comptes restaurant), permet de voir tous les restaurants clients,
en créer/supprimer, suspendre/réactiver un client, et réinitialiser le mot
de passe de n'importe quel utilisateur. Ce compte n'appartient à aucun
restaurant — il est complètement séparé du modèle `User`.

**Bootstrap du premier compte superadmin** (une seule fois) :

```bash
cd backend
npm run create-platform-admin:prod -- --username=TONIDENTIFIANT --email=toi@exemple.com
```

(ou `npm run create-platform-admin` en local pour tester d'abord). Le mot
de passe est généré automatiquement et affiché à l'écran — connexion ensuite
sur `https://<projet>.vercel.app/admin`.

## Développement local : rien ne change

`backend/.env` garde `DATABASE_URL`/`DIRECT_URL` pointant sur Postgres local,
et `BLOB_READ_WRITE_TOKEN` reste vide → l'upload retombe automatiquement sur
le disque (`backend/uploads/`), comme avant.

```bash
npm run dev:backend    # API sur http://localhost:3010
npm run dev:frontend   # Vite sur http://localhost:5173, proxy /api vers 3010
```

## Limites connues du plan gratuit

- **Neon Free** : la base se met en veille après inactivité ; la première
  requête après une pause peut prendre quelques secondes (cold start DB).
- **Vercel Blob Free** : 1 Go de stockage — largement suffisant pour un logo
  et des photos de produits d'un seul restaurant.
- **Fonctions serverless** : pas d'état en mémoire persistant entre requêtes
  (le rate-limit et le cache de connexion DB sont donc par instance, pas globaux).
