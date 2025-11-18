# 🔄 Guide de Réinitialisation Complète de la Base de Données

## ⚠️ ATTENTION

Ce script **supprime TOUTES les données** de la base de données et ne conserve que le compte administrateur par défaut.

**À utiliser uniquement si vous voulez recommencer à zéro !**

---

## 📋 Ce qui sera supprimé

- ✅ Tous les utilisateurs (sauf admin)
- ✅ Toutes les commandes
- ✅ Tous les paiements
- ✅ Tous les produits et catégories
- ✅ Tous les ingrédients et stocks
- ✅ Toutes les clôtures
- ✅ Tous les logs d'activité
- ✅ Toutes les tables
- ✅ Toutes les options

## 📋 Ce qui sera conservé/créé

- ✅ **Compte admin par défaut**
  - Username: `admin`
  - Password: `Admin123`
  - Email: `admin@fastfood.com`
  - Rôle: ADMIN

- ✅ **Paramètres par défaut de l'application**
  - Nom: Gestion Fast-Food
  - Icône: 🍔
  - Monnaie: FCFA

---

## 🚀 Comment utiliser

### Option 1: Via PowerShell (Windows) - **RECOMMANDÉ**

```powershell
# Ouvrir PowerShell dans le dossier du projet
cd C:\chemin\vers\Gestion_Fast_Food

# Exécuter le script
.\reset-database-complete.ps1
```

### Option 2: Via Bash (Linux/macOS/WSL)

```bash
# Rendre le script exécutable
chmod +x reset-database-complete.sh

# Exécuter le script
./reset-database-complete.sh
```

### Option 3: Manuellement via psql

```bash
# Windows (PowerShell)
$env:PGPASSWORD="Admin123"
psql -h localhost -p 5432 -U postgres -d fastfood_db -f backend/reset-database-complete.sql

# Linux/macOS
PGPASSWORD=Admin123 psql -h localhost -p 5432 -U postgres -d fastfood_db -f backend/reset-database-complete.sql
```

---

## 📝 Étapes après la réinitialisation

1. **Connectez-vous avec le compte admin**
   - Username: `admin`
   - Password: `Admin123`

2. **Configurez les paramètres de l'application**
   - Nom de votre restaurant
   - Logo/icône
   - Informations de l'entreprise
   - Couleurs du thème

3. **Créez vos utilisateurs**
   - Gérants (MANAGER)
   - Caissiers (CASHIER)
   - Cuisiniers (KITCHEN)
   - Serveurs (WAITER)

4. **Configurez votre catalogue**
   - Catégories de produits
   - Produits
   - Options (suppléments, choix)
   - Ingrédients (si nécessaire)

5. **Commencez à utiliser l'application !** 🎉

---

## ⚙️ Configuration requise

- PostgreSQL en cours d'exécution
- Base de données `fastfood_db` existante
- Accès utilisateur `postgres` (ou modifiez les scripts)

---

## 🔧 Dépannage

### Erreur: "psql: command not found"
- **Windows**: Ajoutez PostgreSQL au PATH ou utilisez le chemin complet
  ```powershell
  & "C:\Program Files\PostgreSQL\14\bin\psql.exe" -h localhost ...
  ```

### Erreur: "connection refused"
- PostgreSQL n'est pas démarré
- **Windows**: `net start postgresql-x64-14`
- **Linux**: `sudo service postgresql start`

### Erreur: "database does not exist"
- La base de données n'existe pas encore
- Créez-la d'abord :
  ```sql
  CREATE DATABASE fastfood_db;
  ```

---

## 🆘 Support

Si vous rencontrez des problèmes, vérifiez :
1. PostgreSQL est bien démarré
2. La base de données existe
3. Les identifiants de connexion sont corrects
4. Vous avez les permissions nécessaires

---

**Dernière mise à jour**: 18 Janvier 2025
