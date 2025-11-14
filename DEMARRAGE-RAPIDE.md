# 🚀 Démarrage Rapide

> **📌 Vous êtes sur Windows?** Consultez plutôt [DEMARRAGE-WINDOWS.md](./DEMARRAGE-WINDOWS.md) pour des instructions adaptées à Windows PowerShell.

## Problème actuel

Les erreurs 500 que vous voyez sont dues aux tables `daily_closures` et `activity_logs` qui n'existent pas encore dans la base de données.

## Solution en 3 étapes

### Étape 1: Démarrer PostgreSQL

Ouvrez un **nouveau terminal** avec les droits administrateur et exécutez:

```bash
sudo service postgresql start
```

OU

```bash
sudo systemctl start postgresql
```

### Étape 2: Exécuter la migration

Dans le terminal de votre projet, exécutez:

```bash
./setup-database.sh
```

**Ou manuellement:**

```bash
cd backend
PGPASSWORD=Admin123 psql -h localhost -U postgres -d fastfood_db -f add_closures_and_logs.sql
```

### Étape 3: Redémarrer le backend

```bash
# Arrêtez le backend actuel (Ctrl+C)
cd backend
npm run dev
```

## Vérification

Une fois fait, vous ne devriez plus avoir d'erreurs 500. Les endpoints suivants devraient fonctionner:

- ✅ `/api/auth/login` - Connexion
- ✅ `/api/closures` - Liste des clôtures
- ✅ `/api/closures/check/:date` - Vérification clôture

## Identifiants de test

Après avoir exécuté le script de reset (optionnel):

```bash
cd backend
npm run reset-db
```

Utilisez:
- **Username:** `admin`
- **Password:** `admin123`

## Problèmes courants

### PostgreSQL ne démarre pas

```bash
# Vérifier le statut
sudo service postgresql status

# Voir les logs
sudo journalctl -u postgresql -n 50
```

### Permission refusée

Si vous avez des erreurs de permission, essayez:

```bash
sudo -u postgres psql -d fastfood_db -f backend/add_closures_and_logs.sql
```

### Les tables existent déjà

Si la migration échoue car les tables existent, c'est normal! Vos tables sont déjà là.

---

## Structure complète du démarrage

```bash
# Terminal 1 - PostgreSQL (une seule fois au démarrage)
sudo service postgresql start

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
cd frontend
npm run tauri dev
```

## Fonctionnalités disponibles

Une fois tout démarré:

### Pour tous les utilisateurs
- 🛒 Point de Vente
- 📋 Commandes
- 📊 Statistiques
- 📦 Stocks
- 🔒 **Clôtures** (chaque utilisateur voit ses propres clôtures)

### Pour les admins uniquement
- 👥 Équipe
- 🍔 Gestion des produits
- 📂 Gestion des catégories
- 👤 Gestion des utilisateurs
- 🔒 **Clôtures** (voit toutes les clôtures de tous les utilisateurs)
