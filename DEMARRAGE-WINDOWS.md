# 🚀 Démarrage Rapide - Windows

## Configuration de la base de données PostgreSQL

### Méthode 1: Script automatique (Recommandé)

Ouvrez **PowerShell** dans le répertoire du projet et exécutez:

```powershell
.\setup-database.ps1
```

Le script va:
1. ✅ Vérifier que PostgreSQL est démarré
2. ✅ Créer la base de données `fastfood_db` si nécessaire
3. ✅ Exécuter les migrations SQL

### Méthode 2: Commandes manuelles

Si vous préférez exécuter les commandes manuellement:

```powershell
# 1. Se placer dans le dossier backend
cd backend

# 2. Définir le mot de passe et exécuter la migration
$env:PGPASSWORD="Admin123"; psql -h localhost -U postgres -d fastfood_db -f add_closures_and_logs.sql
```

### Méthode 3: Via pgAdmin

1. Ouvrez **pgAdmin**
2. Connectez-vous au serveur PostgreSQL
3. Créez une base de données nommée `fastfood_db` (si elle n'existe pas)
4. Clic droit sur `fastfood_db` → **Query Tool**
5. Ouvrez le fichier `backend/add_closures_and_logs.sql`
6. Exécutez le script (F5 ou bouton ▶️)

## Démarrage de l'application

### Terminal 1: Backend

```powershell
cd backend
npm run dev
```

Le backend démarre sur `http://localhost:3000`

### Terminal 2: Frontend

```powershell
cd frontend
npm run tauri dev
```

L'application Tauri se lance automatiquement.

## Identifiants par défaut

Après avoir exécuté le reset de la base de données (optionnel):

```powershell
cd backend
npm run reset-db
```

Utilisez:
- **Username:** `admin`
- **Password:** `admin123`

## Problèmes courants

### PostgreSQL n'est pas démarré

**Solution 1: Via Services Windows**
1. Appuyez sur `Windows + R`
2. Tapez `services.msc`
3. Cherchez le service `postgresql-x64-XX` (XX = votre version)
4. Clic droit → **Démarrer**

**Solution 2: Ligne de commande (Admin)**
```powershell
# Remplacez XX par votre version PostgreSQL (ex: 15, 16)
net start postgresql-x64-XX
```

**Solution 3: Via pgAdmin**
- Ouvrez pgAdmin, il démarrera automatiquement PostgreSQL

### "psql n'est pas reconnu"

PostgreSQL n'est pas dans le PATH système.

**Solution:**
1. Trouvez l'emplacement d'installation PostgreSQL (généralement `C:\Program Files\PostgreSQL\XX\bin`)
2. Ajoutez-le au PATH:
   - Panneau de configuration → Système → Paramètres système avancés
   - Variables d'environnement
   - Dans "Path", ajoutez: `C:\Program Files\PostgreSQL\XX\bin`
3. Redémarrez PowerShell

**Alternative:** Utilisez le chemin complet:
```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h localhost -U postgres -d fastfood_db -f add_closures_and_logs.sql
```

### Erreur "mot de passe incorrect"

Vérifiez que votre mot de passe PostgreSQL est bien `Admin123`.

Pour le changer:
```powershell
psql -h localhost -U postgres
# Puis dans psql:
ALTER USER postgres PASSWORD 'Admin123';
```

### Port 5432 déjà utilisé

Vérifiez qu'aucune autre instance de PostgreSQL ne tourne:

```powershell
netstat -ano | findstr :5432
```

## Structure des fichiers

```
Gestion_Fast_Food/
├── backend/
│   ├── .env                          # Configuration (DATABASE_URL)
│   ├── add_closures_and_logs.sql    # Migration SQL
│   ├── src/
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── setup-database.ps1                # Script setup Windows
└── DEMARRAGE-WINDOWS.md             # Ce fichier
```

## Vérification de l'installation

Une fois tout configuré, testez que tout fonctionne:

```powershell
# Terminal 1
cd backend
npm run dev

# Vous devriez voir:
# ✅ Server listening at http://0.0.0.0:3000
# ✅ Connected to database successfully
```

```powershell
# Terminal 2
cd frontend
npm run tauri dev

# L'application se lance avec la page de connexion
```

## Accès à la base de données

### Via psql (ligne de commande)

```powershell
$env:PGPASSWORD="Admin123"; psql -h localhost -U postgres -d fastfood_db
```

### Via pgAdmin

1. Ouvrez pgAdmin
2. Serveurs → PostgreSQL → Databases → fastfood_db
3. Explorez les tables: `daily_closures`, `activity_logs`, etc.

## Fonctionnalités disponibles

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

## Support

Si vous rencontrez des problèmes:

1. Vérifiez que PostgreSQL est bien démarré
2. Vérifiez la connexion à la base de données dans `.env`
3. Consultez les logs du backend dans le terminal
4. Vérifiez les logs PostgreSQL dans pgAdmin

---

**Astuce:** Gardez pgAdmin ouvert, il facilite la gestion de PostgreSQL sur Windows!
