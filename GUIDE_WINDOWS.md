# 🪟 Guide d'Installation Windows - FastFood

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Installation avec Docker (Recommandé)](#installation-avec-docker)
3. [Installation Manuelle (Avancée)](#installation-manuelle)
4. [Utilisation Quotidienne](#utilisation-quotidienne)
5. [Maintenance](#maintenance)
6. [Déploiement Multi-Postes](#déploiement-multi-postes)
7. [Problèmes Fréquents](#problèmes-fréquents)

---

## ⚙️ PRÉREQUIS

### Configuration Minimale

```
💻 Windows 10/11 (64-bit)
🧠 4 GB RAM (8 GB recommandé)
💾 10 GB d'espace disque libre
🌐 Connexion Internet (pour l'installation uniquement)
```

### Logiciels Requis

#### Option 1 : Installation Docker (Recommandée - SIMPLE)

1. **Docker Desktop pour Windows**
   - Télécharger : https://www.docker.com/products/docker-desktop
   - Taille : ~500 MB
   - Installation : ~10 minutes
   - **C'est TOUT !** Rien d'autre nécessaire

#### Option 2 : Installation Manuelle (Avancée)

1. **Node.js 20+**
   - Télécharger : https://nodejs.org/
   - Version LTS recommandée

2. **PostgreSQL 15+**
   - Télécharger : https://www.postgresql.org/download/windows/
   - Installer avec pgAdmin

3. **Git** (optionnel)
   - Télécharger : https://git-scm.com/download/win

---

## 🐳 INSTALLATION AVEC DOCKER (Recommandée)

### Avantages de Docker

```
✅ Installation ultra-simple (3 clics)
✅ Tout inclus (base de données + backend + frontend)
✅ Fonctionne immédiatement
✅ Facile à mettre à jour
✅ Facile à sauvegarder/restaurer
✅ Portable (peut déplacer sur autre PC)
```

### Étape 1 : Installer Docker Desktop

1. **Télécharger Docker Desktop**
   - Aller sur : https://www.docker.com/products/docker-desktop
   - Cliquer sur "Download for Windows"
   - Télécharger le fichier `.exe` (~500 MB)

2. **Installer Docker Desktop**
   - Double-cliquer sur le fichier téléchargé
   - Suivre l'assistant d'installation
   - Accepter les options par défaut
   - Redémarrer Windows si demandé

3. **Démarrer Docker Desktop**
   - Ouvrir Docker Desktop depuis le menu démarrer
   - Attendre que l'icône devienne verte (Docker est prêt)
   - Accepter les termes de service

**⏱️ Temps estimé : 15-20 minutes**

### Étape 2 : Télécharger l'Application

#### Méthode A : Avec Git (si installé)

```bash
# Ouvrir PowerShell ou Git Bash
cd C:\
git clone https://github.com/VotreCompte/Gestion_Fast_Food.git
cd Gestion_Fast_Food
```

#### Méthode B : Téléchargement Direct

1. Aller sur : https://github.com/VotreCompte/Gestion_Fast_Food
2. Cliquer sur "Code" → "Download ZIP"
3. Extraire le ZIP dans `C:\Gestion_Fast_Food`

### Étape 3 : Installation Automatique

1. **Ouvrir le dossier de l'application**
   - Aller dans `C:\Gestion_Fast_Food`

2. **Double-cliquer sur `install-windows.bat`**
   - Le script va :
     ✓ Vérifier Docker
     ✓ Créer la configuration
     ✓ Télécharger les images Docker
     ✓ Installer l'application
     ✓ Démarrer automatiquement

3. **Attendre la fin de l'installation**
   - Temps estimé : 5-10 minutes
   - Vous verrez la progression dans la console

4. **C'EST FINI !**
   ```
   ✓ Application installée
   ✓ Base de données créée
   ✓ Compte admin créé
   ```

### Étape 4 : Première Connexion

1. **Ouvrir votre navigateur**
   - Chrome, Firefox, Edge (au choix)

2. **Aller sur : http://localhost**

3. **Se connecter**
   ```
   Username : admin
   Password : Admin123
   ```

4. **⚠️ IMPORTANT : Changer le mot de passe**
   - Aller dans "Profil" ou "Paramètres"
   - Changer le mot de passe immédiatement

---

## 🔧 INSTALLATION MANUELLE (Avancée)

<details>
<summary>Cliquez ici pour les instructions d'installation manuelle</summary>

### Prérequis Installés

- ✅ Node.js 20+
- ✅ PostgreSQL 15+
- ✅ Git (optionnel)

### Étape 1 : Cloner le Projet

```powershell
cd C:\
git clone https://github.com/VotreCompte/Gestion_Fast_Food.git
cd Gestion_Fast_Food
```

### Étape 2 : Configurer PostgreSQL

1. **Ouvrir pgAdmin**

2. **Créer une base de données**
   - Nom : `fastfood_db`
   - Owner : `postgres`

3. **Créer un utilisateur** (optionnel)
   ```sql
   CREATE USER fastfood_admin WITH PASSWORD 'VotreMotDePasse';
   GRANT ALL PRIVILEGES ON DATABASE fastfood_db TO fastfood_admin;
   ```

### Étape 3 : Configurer le Backend

```powershell
cd backend

# Copier le fichier d'exemple
copy .env.example .env

# Éditer .env avec Notepad
notepad .env
```

Modifier la ligne `DATABASE_URL` :
```bash
DATABASE_URL="postgresql://postgres:VotreMotDePasse@localhost:5432/fastfood_db?schema=public"
```

```powershell
# Installer les dépendances
npm install

# Générer Prisma Client
npm run prisma:generate

# Appliquer les migrations
npm run migrate:deploy

# Créer l'admin et hasher les mots de passe
npm run hash-passwords
```

### Étape 4 : Configurer le Frontend

```powershell
cd ..\frontend

# Installer les dépendances
npm install

# Créer le fichier .env.local
echo VITE_API_URL=http://localhost:3000 > .env.local
```

### Étape 5 : Démarrer l'Application

**Ouvrir 2 fenêtres PowerShell :**

**Fenêtre 1 - Backend :**
```powershell
cd C:\Gestion_Fast_Food\backend
npm run dev
```

**Fenêtre 2 - Frontend :**
```powershell
cd C:\Gestion_Fast_Food\frontend
npm run dev
```

**Ouvrir le navigateur : http://localhost:5173**

</details>

---

## 📱 UTILISATION QUOTIDIENNE

### Démarrer l'Application (Docker)

**Méthode 1 : Double-clic sur `start.bat`**
- Ouvre automatiquement le navigateur
- Prêt en 10-15 secondes

**Méthode 2 : Manuellement**
```powershell
cd C:\Gestion_Fast_Food
docker-compose up -d
```

### Arrêter l'Application

**Double-clic sur `stop.bat`**

ou

```powershell
docker-compose stop
```

### Voir les Logs

**Double-clic sur `logs.bat`**

ou

```powershell
docker-compose logs -f
```

---

## 💾 MAINTENANCE

### Sauvegardes

#### Sauvegarde Manuelle

**Double-clic sur `backup.bat`**

Crée un fichier dans `backups\backup_YYYYMMDD_HHMMSS.sql`

#### Sauvegarde Automatique

**Créer une tâche planifiée Windows :**

1. Ouvrir "Planificateur de tâches"
2. Créer une tâche simple
3. Déclencheur : Tous les jours à 3h du matin
4. Action : `C:\Gestion_Fast_Food\backup.bat`

### Restauration

```powershell
# Arrêter l'application
.\stop.bat

# Restaurer la base de données
docker-compose exec -T postgres psql -U fastfood_admin -d fastfood_db < backups\backup_20250118.sql

# Redémarrer
.\start.bat
```

### Mises à Jour

```powershell
# Arrêter l'application
.\stop.bat

# Mettre à jour le code
git pull

# Reconstruire
docker-compose up -d --build

# Les données sont préservées !
```

---

## 🏢 DÉPLOIEMENT MULTI-POSTES

### Architecture Réseau

```
┌─────────────────────┐
│   PC SERVEUR        │
│  (192.168.1.100)    │
│                     │
│  - Base de données  │
│  - Backend API      │
│  - Frontend Web     │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │   Switch    │
    └──────┬──────┘
           │
  ┌────────┼────────┐
  │        │        │
┌─▼──┐  ┌─▼──┐  ┌─▼──┐
│PC 1│  │PC 2│  │Tab │
│Cais│  │Cais│  │Cui │
│se  │  │se  │  │sine│
└────┘  └────┘  └────┘
```

### Configuration PC Serveur

1. **Installer normalement avec Docker**

2. **Configurer une IP statique**
   - Panneau de configuration → Réseau
   - Propriétés de la carte réseau
   - IPv4 → IP statique : `192.168.1.100`

3. **Autoriser le pare-feu Windows**
   ```powershell
   # Ouvrir PowerShell en admin
   New-NetFirewallRule -DisplayName "FastFood HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
   New-NetFirewallRule -DisplayName "FastFood API" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
   ```

4. **Modifier docker-compose.yml**
   ```yaml
   # Dans la section frontend, changer :
   environment:
     VITE_API_URL: http://192.168.1.100:3000  # IP du serveur
   ```

### Configuration Postes Clients (Caisses)

**Option A : Navigateur en Mode Kiosque**

Créer un fichier `FastFood.bat` sur le bureau :
```batch
@echo off
start chrome.exe --kiosk --no-first-run --app=http://192.168.1.100
```

**Option B : Raccourci Simple**

1. Clic droit sur le bureau → Nouveau → Raccourci
2. URL : `http://192.168.1.100`
3. Nom : "FastFood Caisse"

**Démarrage Automatique :**

1. Appuyer sur `Win + R`
2. Taper : `shell:startup`
3. Copier `FastFood.bat` dans ce dossier

---

## ❓ PROBLÈMES FRÉQUENTS

### 1. Docker Desktop ne démarre pas

**Symptôme** : "Docker Desktop starting..." indéfiniment

**Solutions** :
```powershell
# Redémarrer le service WSL
wsl --shutdown

# Redémarrer Windows
shutdown /r /t 0
```

### 2. "Port 80 already in use"

**Symptôme** : Erreur au démarrage

**Solutions** :

**Option A : Arrêter IIS (si installé)**
```powershell
# PowerShell en admin
Stop-Service -Name W3SVC
Set-Service -Name W3SVC -StartupType Disabled
```

**Option B : Changer le port**

Modifier `docker-compose.yml` :
```yaml
frontend:
  ports:
    - "8080:80"  # Au lieu de 80:80
```

Accéder via : `http://localhost:8080`

### 3. "Cannot connect to database"

**Solutions** :

1. **Vérifier que Docker tourne**
   ```powershell
   docker ps
   ```

2. **Voir les logs de la base de données**
   ```powershell
   docker-compose logs postgres
   ```

3. **Redémarrer tout**
   ```powershell
   .\stop.bat
   .\start.bat
   ```

### 4. Page blanche / 401 Unauthorized

**Symptôme** : Frontend s'affiche mais erreurs 401

**Solution** : Le token JWT est expiré ou invalide

```
1. Ouvrir la console du navigateur (F12)
2. Onglet "Application" → "Local Storage"
3. Supprimer "authToken"
4. Rafraîchir la page (F5)
5. Se reconnecter
```

### 5. Imprimante ne fonctionne pas

**Solutions** :

1. **Vérifier les drivers**
   - Imprimante installée dans Windows ?
   - Impression de test Windows fonctionne ?

2. **Configurer comme imprimante par défaut**
   - Paramètres → Imprimantes
   - Définir par défaut

3. **Tester l'impression depuis le navigateur**
   - Ctrl + P dans l'application
   - Choisir l'imprimante

### 6. Lenteurs / Application rame

**Solutions** :

1. **Vérifier les ressources**
   ```powershell
   docker stats
   ```

2. **Augmenter les ressources Docker**
   - Docker Desktop → Settings → Resources
   - CPU : 2 minimum
   - RAM : 4 GB minimum

3. **Nettoyer Docker**
   ```powershell
   docker system prune -a
   ```

---

## 🚀 OPTIMISATIONS POUR LA PRODUCTION

### 1. Démarrage Automatique au Boot

**Créer une tâche planifiée :**

1. Ouvrir "Planificateur de tâches"
2. Créer une tâche
3. Déclencheur : Au démarrage du système
4. Action : `C:\Gestion_Fast_Food\start.bat`
5. Conditions : Décocher "Démarrer uniquement sur secteur"

### 2. Désactiver les Mises à Jour Windows (Optionnel)

Pour éviter les redémarrages pendant le service :

1. Services → Windows Update
2. Type de démarrage : Désactivé

⚠️ **Attention** : Mettre à jour manuellement régulièrement !

### 3. Mode Performances

1. Panneau de configuration → Options d'alimentation
2. Choisir "Performances élevées"

### 4. Désactiver l'Hibernation

```powershell
# PowerShell en admin
powercfg /hibernate off
```

Libère plusieurs GB d'espace disque.

---

## 📊 CONFIGURATION MULTI-RESTAURANTS (Franchises)

Si vous déployez dans plusieurs restaurants :

### Structure Recommandée

```
C:\FastFood\
├── Restaurant_Paris\
│   ├── docker-compose.yml
│   ├── .env
│   └── backups\
├── Restaurant_Lyon\
│   ├── docker-compose.yml
│   ├── .env
│   └── backups\
└── Restaurant_Marseille\
    ├── docker-compose.yml
    ├── .env
    └── backups\
```

### Personnalisation par Restaurant

**Modifier `.env` dans chaque dossier :**

```bash
# Restaurant Paris
RESTAURANT_NAME="FastFood Paris Bastille"
JWT_SECRET="secret-unique-paris-xyz123"

# Restaurant Lyon
RESTAURANT_NAME="FastFood Lyon Part-Dieu"
JWT_SECRET="secret-unique-lyon-abc456"
```

### Centralisation des Données (Avancé)

**Synchronisation Cloud** :

1. OneDrive / Google Drive sur chaque PC
2. Script de sauvegarde automatique vers le cloud
3. Consolidation des stats dans un tableau de bord central

---

## 🎯 CHECKLIST PRÉ-DÉPLOIEMENT

Avant d'installer chez un client :

- [ ] Docker Desktop installé et testé
- [ ] Réseau configuré (IP statique si multi-postes)
- [ ] Pare-feu configuré
- [ ] Imprimantes installées et testées
- [ ] Backup initial créé
- [ ] Mot de passe admin changé
- [ ] Logo et couleurs personnalisés
- [ ] Produits et catégories ajoutés
- [ ] Comptes employés créés
- [ ] Formation du personnel effectuée

---

## 📞 SUPPORT

### Auto-diagnostic

```powershell
# Vérifier l'état de tous les services
docker-compose ps

# Voir les logs
.\logs.bat

# Tester la connexion à la base
docker-compose exec postgres psql -U fastfood_admin -d fastfood_db -c "SELECT COUNT(*) FROM users;"
```

### Commandes Utiles

```powershell
# Redémarrage complet
docker-compose restart

# Reconstruire après modification
docker-compose up -d --build

# Voir l'utilisation des ressources
docker stats

# Nettoyer tout (⚠️ ATTENTION : Supprime les données)
docker-compose down -v
```

---

## 🎉 CONCLUSION

Avec Docker, l'installation est **ultra-simple** :

1. ✅ Installer Docker Desktop (15 min)
2. ✅ Double-clic sur `install-windows.bat` (10 min)
3. ✅ C'est prêt ! 🚀

**Avantages pour vendre aux restaurants** :

- 💼 Installation professionnelle
- 🕐 Déploiement rapide (30 min total)
- 🔄 Mises à jour faciles
- 💾 Sauvegardes automatiques
- 🛡️ Isolation sécurisée
- 📦 Portable et reproductible

**Vous êtes prêt à déployer dans des vrais restaurants ! 🍔**

---

**Version** : 1.0.0
**Date** : 2025-01-18
**Auteur** : Guide Windows FastFood
