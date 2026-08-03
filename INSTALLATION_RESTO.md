# Installation FastFood au restaurant

Guide pas-à-pas pour installer et lancer la caisse sur le PC du restaurant (Windows).

---

## 1. Prérequis (à installer une seule fois)

1. **Node.js 20** → https://nodejs.org (choisir « LTS »). Installation par défaut.
2. **PostgreSQL 15 ou +** → https://www.postgresql.org/download/windows/
   - Pendant l'installation, **notez le mot de passe** du super-utilisateur `postgres`.
   - Laissez le port par défaut **5432**.

Pour vérifier que tout est installé, ouvrez l'invite de commandes (`cmd`) et tapez :
```
node --version
psql --version
```
Les deux doivent afficher un numéro de version.

---

## 2. Préparer la base de données (une seule fois)

1. Ouvrez **pgAdmin** (installé avec PostgreSQL) ou l'invite `psql`.
2. Créez une base nommée **`fastfood_db`**.
3. Ouvrez le fichier **`backend\.env`** et vérifiez la ligne `DATABASE_URL` :
   ```
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/fastfood_db?schema=public"
   ```
   Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe `postgres` noté à l'étape 1.
   > ⚠️ Si vous changez ce mot de passe, mettez aussi à jour `PGPASSWORD` dans **`backup-db.bat`**.

4. Dans l'invite de commandes, placez-vous dans le dossier `backend` et initialisez :
   ```
   cd backend
   npm install
   npm run prisma:generate
   npm run migrate:deploy
   npm run seed              REM cree les donnees de base + les comptes
   npm run hash-passwords    REM OBLIGATOIRE : chiffre les mots de passe (sinon la connexion echoue)
   ```
   > ⚠️ `hash-passwords` est **indispensable** : sans lui, les mots de passe restent en clair et la connexion est refusée. À ne lancer qu'une fois, juste après le seed.
5. Installez aussi les dépendances de l'interface :
   ```
   cd ..\frontend
   npm install
   ```

---

## 3. Construire l'application (après chaque mise à jour du code)

Depuis le dossier du projet :
```
cd backend
npm run build
cd ..\frontend
npm run build
```

---

## 4. Lancer la caisse au quotidien

➡️ **Double-cliquez sur `start.bat`** (à la racine du projet).

- Deux fenêtres noires s'ouvrent (le serveur + l'interface) : **laissez-les ouvertes**.
- Le navigateur s'ouvre sur http://localhost:5173.
- Pour tout arrêter en fin de journée : **fermez les deux fenêtres noires**.

> Vous pouvez créer un raccourci de `start.bat` sur le Bureau pour un démarrage en 1 clic.

---

## 5. ⚠️ Premier démarrage : sécuriser le compte admin

Identifiants par défaut : **admin / admin123**

**Dès la première connexion :**
1. Connectez-vous en `admin`.
2. Allez dans **Utilisateurs**, modifiez le compte `admin` et mettez un **mot de passe fort**.
3. Créez les comptes du personnel (caissier, cuisine…) avec les bons rôles.

---

## 6. Sauvegarde de la base (très important)

Une panne ou un disque HS = perte des ventes. **Sauvegardez chaque jour.**

➡️ **Double-cliquez sur `backup-db.bat`** : un fichier `.sql` daté est créé dans le dossier `backups\`.

**Automatiser (recommandé)** — planifier une sauvegarde quotidienne :
1. Ouvrez le **Planificateur de tâches** Windows.
2. « Créer une tâche de base » → déclencheur **Quotidien** (ex. 23h30) → action **Démarrer un programme** → sélectionnez `backup-db.bat`.

> Copiez régulièrement le dossier `backups\` sur une **clé USB** ou un disque externe.

**Restaurer une sauvegarde** (en cas de besoin) :
```
psql -U postgres -h localhost -d fastfood_db < backups\fichier_de_sauvegarde.sql
```

---

## 7. Plusieurs postes de caisse (réseau local)

Par défaut, l'application est réglée pour **un seul PC**. Pour utiliser plusieurs caisses reliées au même serveur :

1. Notez l'adresse IP locale du PC serveur (`ipconfig` → ex. `192.168.1.10`).
2. Dans **`frontend\.env`**, remplacez :
   ```
   VITE_API_URL=http://192.168.1.10:3010
   ```
3. Dans **`backend\.env`**, ajoutez cette origine à `ALLOWED_ORIGINS` :
   ```
   ALLOWED_ORIGINS="http://localhost:5173,http://192.168.1.10:5173"
   ```
4. **Reconstruisez** l'interface (`cd frontend && npm run build`) et relancez.
5. Sur les autres PC, ouvrez le navigateur sur `http://192.168.1.10:5173`.

---

## 8. Problèmes fréquents

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| La fenêtre serveur se ferme aussitôt | PostgreSQL non démarré ou mauvais mot de passe | Vérifiez le service PostgreSQL et `DATABASE_URL` dans `backend\.env` |
| « Impossible de contacter le serveur » | Le serveur (API) n'est pas lancé | Laissez la fenêtre `start-backend` ouverte |
| Page blanche / 401 en boucle | Build pas à jour | Refaites l'étape 3 (build) |
| `pg_dump` introuvable lors du backup | PostgreSQL pas dans le PATH | Décommentez la ligne `PATH` dans `backup-db.bat` et ajustez la version |

---

**Compte par défaut : admin / admin123 → à changer immédiatement.**
**Serveur API : port 3010 · Interface caisse : port 5173.**
