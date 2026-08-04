# Déploiement sur Vercel + Neon

Ce projet est configuré en **un seul projet Vercel** : le frontend (React/Vite)
et l'API (Fastify) sont déployés ensemble, sur le même domaine. Le front
appelle l'API en URL relative (`/api/...`), donc pas de CORS à configurer côté
client.

- Frontend → build statique servi par Vercel (`frontend/dist`)
- API → fonction serverless unique `api/[...path].ts`, qui charge l'app
  Fastify définie dans `backend/src/app.ts`
- Base de données → Postgres géré par [Neon](https://neon.tech)
- Uploads (logo, photos produits) → [Vercel Blob](https://vercel.com/storage/blob)

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
2. Vercel détecte `vercel.json` à la racine ; les champs *Build Command* /
   *Output Directory* sont déjà fixés par ce fichier, rien à changer dans l'UI.
3. **Root Directory** : laisser la racine du dépôt (ne pas pointer sur `frontend/` ni `backend/`).

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

Avant le premier déploiement, la base Neon est vide : il faut y créer les
tables. Depuis un poste avec Node installé, en local :

```bash
cd backend
# Remplacer temporairement DATABASE_URL et DIRECT_URL dans backend/.env
# par les valeurs Neon (la connexion DIRECT, pas pooled, pour db push),
# puis :
npx prisma db push
npm run seed          # optionnel : données de démo / catégories fast-food
npm run hash-passwords # si migration depuis une base existante avec mots de passe en clair
```

Remettre ensuite `backend/.env` sur les valeurs locales pour continuer à
développer contre la base Postgres locale.

## 6. Déployer

Un `git push` sur `main` (ou le déploiement manuel depuis le dashboard Vercel)
déclenche le build. Vercel exécute `npm run vercel-build` (génère le client
Prisma, build le frontend), puis déploie `api/[...path].ts` comme fonction
serverless.

Vérifier ensuite :
- `https://<projet>.vercel.app/api/health` → `{"status":"ok","database":"connected"}`
- `https://<projet>.vercel.app/` → écran de connexion
- Connexion avec un compte créé par le seed, upload d'une image de produit
  (doit renvoyer une URL `https://....public.blob.vercel-storage.com/...`)

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
