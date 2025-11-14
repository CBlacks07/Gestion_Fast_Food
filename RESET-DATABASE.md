# Réinitialisation de la Base de Données

Ce guide explique comment réinitialiser complètement votre base de données.

## ⚠️ ATTENTION

**Ces scripts suppriment TOUTES les données de votre base de données !**

Ils suppriment :
- ✗ Tous les utilisateurs (sauf admin qui sera recréé)
- ✗ Tous les produits et catégories
- ✗ Toutes les commandes et paiements
- ✗ Tous les stocks et ingrédients
- ✗ Toutes les clôtures de journée
- ✗ Tous les logs d'activité

Seul l'utilisateur admin sera recréé avec les identifiants par défaut.

## 📋 Prérequis

- PostgreSQL doit être démarré
- La base de données `fastfood_db` doit exister
- Node.js et le package `bcrypt` doivent être installés dans le dossier `backend`

## 🪟 Windows (PowerShell)

```powershell
# À la racine du projet
.\reset-database.ps1
```

Le script vous demandera de taper **OUI** en majuscules pour confirmer.

## 🐧 Linux / 🍎 macOS (Bash)

```bash
# À la racine du projet
./reset-database.sh
```

Le script vous demandera de taper **OUI** en majuscules pour confirmer.

## 📝 Résultat

Après la réinitialisation, vous pourrez vous connecter avec :

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@fastfood.com`
- **Rôle:** ADMIN

## 🚀 Après la réinitialisation

1. **Redémarrez le backend** (si déjà en cours d'exécution) :
   ```bash
   cd backend
   npm run dev
   ```

2. **Redémarrez le frontend** (si déjà en cours d'exécution) :
   ```bash
   cd frontend
   npm run tauri dev
   ```

3. **Connectez-vous** avec les identifiants ci-dessus

4. **Créez vos données** :
   - Créez des catégories
   - Créez des produits
   - Créez d'autres utilisateurs si nécessaire

## 🔧 En cas d'erreur

### Erreur "psql not recognized"

**Windows :**
- Ajoutez PostgreSQL au PATH : `C:\Program Files\PostgreSQL\15\bin`
- OU utilisez pgAdmin pour exécuter manuellement `backend/reset-database.sql` (après avoir remplacé le hash du mot de passe)

**Linux/macOS :**
- Installez PostgreSQL client : `sudo apt-get install postgresql-client` (Ubuntu/Debian)

### Erreur "Cannot connect to PostgreSQL"

- Vérifiez que PostgreSQL est démarré
- Vérifiez le mot de passe dans le script (par défaut : `Admin123`)
- Vérifiez que la base `fastfood_db` existe

### Erreur "bcrypt not found"

```bash
cd backend
npm install
```

## 🔄 Alternative manuelle (sans script)

Si les scripts ne fonctionnent pas, vous pouvez réinitialiser manuellement :

1. **Ouvrez pgAdmin** ou tout autre client PostgreSQL

2. **Connectez-vous** à la base `fastfood_db`

3. **Exécutez ces commandes** dans l'ordre :

```sql
-- Supprimer toutes les données
TRUNCATE TABLE "activity_logs" CASCADE;
TRUNCATE TABLE "daily_closures" CASCADE;
TRUNCATE TABLE "stock_movements" CASCADE;
TRUNCATE TABLE "recipes" CASCADE;
TRUNCATE TABLE "order_item_options" CASCADE;
TRUNCATE TABLE "order_items" CASCADE;
TRUNCATE TABLE "payments" CASCADE;
TRUNCATE TABLE "orders" CASCADE;
TRUNCATE TABLE "product_options" CASCADE;
TRUNCATE TABLE "products" CASCADE;
TRUNCATE TABLE "categories" CASCADE;
TRUNCATE TABLE "options" CASCADE;
TRUNCATE TABLE "ingredients" CASCADE;
TRUNCATE TABLE "tables" CASCADE;
TRUNCATE TABLE "users" CASCADE;

-- Recréer l'admin (générez d'abord le hash bcrypt)
INSERT INTO "users" (
  "id", "email", "username", "password",
  "firstName", "lastName", "role", "isActive",
  "createdAt", "updatedAt"
) VALUES (
  'admin-default-id',
  'admin@fastfood.com',
  'admin',
  '$2b$10$...',  -- Remplacez par le hash bcrypt de 'admin123'
  'Admin',
  'System',
  'ADMIN',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

Pour générer le hash bcrypt :
```bash
cd backend
node -e "require('bcrypt').hash('admin123', 10, (e, h) => console.log(h))"
```

## 💡 Conseils

- **Sauvegardez** vos données importantes avant de réinitialiser
- Utilisez ce script uniquement en développement
- En production, utilisez des migrations appropriées
- Ne commitez jamais de mots de passe en clair dans Git

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs PostgreSQL
2. Que tous les services sont démarrés
3. Les permissions sur les fichiers de script
