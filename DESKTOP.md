# 🖥️ Fast Food Management - Application Desktop

Guide complet pour créer et distribuer l'application desktop standalone.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Build de l'application](#build-de-lapplication)
4. [Installation](#installation)
5. [Caractéristiques](#caractéristiques)
6. [Architecture technique](#architecture-technique)
7. [Distribution](#distribution)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

L'application desktop Fast Food Management est une version **standalone** qui fonctionne **sans Docker** et **100% offline**.

### Différences avec la version web

| Fonctionnalité | Version Web | Version Desktop |
|----------------|-------------|-----------------|
| **Installation** | Docker + navigateur | Double-clic .exe |
| **Base de données** | PostgreSQL (Docker) | SQLite embarqué |
| **Port backend** | 3000 | **3002** |
| **Réseau** | Optionnel | Pas nécessaire |
| **Mise à jour** | Git pull + rebuild | Nouvel installateur |
| **Distribution** | Package Docker | Fichier .exe/.dmg |

### Avantages

✅ **Installation simple** : Double-clic, pas de configuration
✅ **Pas de Docker** : Plus besoin d'installer Docker Desktop
✅ **Offline complet** : Fonctionne sans internet
✅ **Performance** : Plus rapide au démarrage
✅ **Native** : Icône sur le bureau, menu démarrer
✅ **Portable** : Base de données dans le dossier utilisateur

---

## 📋 Prérequis

### Pour builder l'application

- **Node.js** v18+ ([télécharger](https://nodejs.org/))
- **npm** v9+ (inclus avec Node.js)
- **Espace disque** : 2 GB libres

### Pour utiliser l'application (utilisateurs finaux)

- **Aucun prérequis !**
- Simplement Windows 10/11, macOS 10.15+, ou Linux moderne

---

## 🏗️ Build de l'application

### Windows

```powershell
# Depuis la racine du projet
.\build-desktop.ps1
```

### Linux / macOS

```bash
# Depuis la racine du projet
chmod +x build-desktop.sh
./build-desktop.sh
```

### Ce que fait le script

1. ✅ Vérifie Node.js et npm
2. ✅ Nettoie les anciens builds
3. ✅ Build du frontend (Vite production)
   - Minification JavaScript/CSS
   - Optimisation des assets
   - Configuration port 3002
4. ✅ Compilation du backend (TypeScript → JavaScript)
   - Transpilation complète
   - Installation dépendances production
   - Prisma schema inclus
5. ✅ Build Electron
   - Package frontend + backend
   - Création de l'installateur
   - Signature (optionnelle)

### Durée du build

- **Première fois** : 10-15 minutes
- **Suivantes** : 3-5 minutes (avec cache)

### Résultat

```
desktop/dist/
├── Fast Food Management-Setup-1.0.0.exe    # Windows
├── Fast Food Management-1.0.0.dmg          # macOS
├── Fast-Food-Management-1.0.0.AppImage     # Linux
└── fast-food-management_1.0.0_amd64.deb    # Linux (deb)
```

---

## 💻 Installation

### Windows

1. **Télécharger** `Fast Food Management-Setup-1.0.0.exe`
2. **Double-cliquer** sur l'installateur
3. **Suivre** l'assistant d'installation
   - Choisir le dossier d'installation
   - Créer un raccourci bureau (recommandé)
4. **Lancer** depuis l'icône bureau ou menu démarrer

### macOS

1. **Télécharger** `Fast Food Management-1.0.0.dmg`
2. **Ouvrir** le fichier .dmg
3. **Glisser** l'application dans le dossier Applications
4. **Lancer** depuis Launchpad ou Applications

⚠️ **Note** : macOS peut demander d'autoriser l'application (Préférences Système → Sécurité)

### Linux

**AppImage (recommandé)** :
```bash
# Rendre exécutable
chmod +x Fast-Food-Management-1.0.0.AppImage

# Lancer
./Fast-Food-Management-1.0.0.AppImage
```

**Debian/Ubuntu (.deb)** :
```bash
sudo dpkg -i fast-food-management_1.0.0_amd64.deb
```

---

## 🚀 Caractéristiques

### Fonctionnalités complètes

✅ **Point de Vente (POS)**
✅ **Gestion des produits**
✅ **Gestion des catégories**
✅ **Gestion des utilisateurs**
✅ **Rapports et statistiques**
✅ **Paramètres de l'application**
✅ **Backup/Restore de la base de données**

### Spécificités Desktop

#### Port Backend: 3002

Le backend tourne sur le port **3002** au lieu de 3000 pour éviter les conflits.

#### Base de données SQLite

La base de données est stockée dans :

**Windows** :
```
C:\Users\[Utilisateur]\AppData\Roaming\fastfood-desktop\database.db
```

**macOS** :
```
~/Library/Application Support/fastfood-desktop/database.db
```

**Linux** :
```
~/.config/fastfood-desktop/database.db
```

#### Données persistantes

- ✅ Base de données
- ✅ Paramètres de l'application
- ✅ JWT Secret (généré automatiquement)
- ✅ Dimensions de la fenêtre

#### Auto-update (optionnel)

Vous pouvez configurer des mises à jour automatiques via Electron Updater.

---

## 🏛️ Architecture technique

### Stack technologique

```
┌─────────────────────────────────────┐
│         Electron (Main Process)     │
│  - Gère la fenêtre                  │
│  - Lance le backend                 │
│  - Gère la base de données          │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼─────┐      ┌───────▼────────┐
│ Backend │      │   Frontend     │
│ Fastify │      │   React + Vite │
│ Port    │◄─────┤   Interface UI │
│ 3002    │      │                │
└───┬─────┘      └────────────────┘
    │
    │
┌───▼──────────┐
│  SQLite DB   │
│  Embedded    │
└──────────────┘
```

### Electron Configuration

**Main Process** (`electron/main.js`) :
- Lance le serveur backend Node.js
- Crée la fenêtre BrowserWindow
- Gère les événements système
- Arrêt propre du backend

**Preload Script** (`electron/preload.js`) :
- Exposition sécurisée des APIs Electron
- Context isolation activé

### Backend Adaptations

Le backend détecte automatiquement qu'il tourne dans Electron :

```javascript
// Détection
const isElectron = process.env.IS_ELECTRON === 'true';

// Configuration
const PORT = 3002;
const DATABASE = 'file:./database.db'; // SQLite au lieu de PostgreSQL
```

### Frontend Adaptations

Le frontend se connecte au port 3002 :

```
VITE_API_URL=http://localhost:3002
```

---

## 📦 Distribution

### Distribuer l'application

#### Option 1 : Fichier direct

Partagez directement le fichier .exe/.dmg/.AppImage :

- **Taille** : 150-250 MB
- **Méthode** : USB, réseau local, serveur de fichiers

#### Option 2 : Service de téléchargement

Hébergez sur un serveur ou service cloud :

- **Dropbox** / **Google Drive** : Pour petits groupes
- **GitHub Releases** : Pour distribution publique
- **Serveur propre** : Pour contrôle total

#### Option 3 : Intranet d'entreprise

Pour restaurants/chaînes :

```
\\serveur-local\fastfood\installateur\
  ├── windows\Fast-Food-Setup.exe
  ├── mac\Fast-Food.dmg
  └── linux\Fast-Food.AppImage
```

### Mises à jour

#### Méthode manuelle

1. Builder la nouvelle version
2. Changer le numéro de version dans `desktop/package.json`
3. Distribuer le nouvel installateur
4. Les utilisateurs installent par-dessus

⚠️ **Important** : La base de données est conservée lors de la mise à jour

#### Méthode automatique (avancé)

Configurer Electron Auto-Updater :

```javascript
// Dans electron/main.js
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

---

## 🐛 Troubleshooting

### L'application ne démarre pas

**Symptôme** : Double-clic ne fait rien

**Solutions** :
1. Vérifier les logs :
   - Windows : `%APPDATA%\fastfood-desktop\logs\`
   - macOS : `~/Library/Logs/fastfood-desktop/`
   - Linux : `~/.config/fastfood-desktop/logs/`

2. Vérifier le port 3002 :
   ```powershell
   # Windows
   netstat -ano | findstr :3002

   # Linux/Mac
   lsof -i :3002
   ```

3. Réinstaller l'application

### Erreur "Port already in use"

**Cause** : Un autre programme utilise le port 3002

**Solutions** :

**Option A** : Trouver et arrêter le programme
```bash
# Linux/Mac
lsof -ti:3002 | xargs kill -9

# Windows
netstat -ano | findstr :3002
taskkill /PID [PID] /F
```

**Option B** : Changer le port (avancé)
Modifier `desktop/electron/main.js` ligne 7 :
```javascript
const BACKEND_PORT = 3003; // Au lieu de 3002
```

Puis rebuild l'application.

### Base de données corrompue

**Symptôme** : Erreurs au démarrage, données manquantes

**Solution** :

1. Fermer l'application
2. Sauvegarder la base actuelle
3. Supprimer `database.db`
4. Relancer (nouvelle DB sera créée)

### Performances lentes

**Causes possibles** :
- Trop de données en base
- Antivirus qui scanne l'app
- Disque dur saturé

**Solutions** :
1. Optimiser la base SQLite :
   ```sql
   VACUUM;
   ANALYZE;
   ```

2. Exclure l'app de l'antivirus

3. Libérer de l'espace disque

### Impossible d'installer (macOS)

**Symptôme** : "L'application ne peut pas être ouverte"

**Cause** : Gatekeeper bloque les apps non signées

**Solution** :
```bash
# Autoriser l'application
sudo xattr -rd com.apple.quarantine "/Applications/Fast Food Management.app"
```

Ou : Préférences Système → Sécurité → Autoriser

### Impossible d'installer (Windows)

**Symptôme** : "Windows a protégé votre PC"

**Cause** : SmartScreen bloque les apps non signées

**Solution** :
1. Cliquer sur "Informations complémentaires"
2. Cliquer sur "Exécuter quand même"

### Backup/Restore de la base de données

**Backup manuel** :

Copier le fichier `database.db` depuis le dossier utilisateur :

```powershell
# Windows
copy %APPDATA%\fastfood-desktop\database.db backup-YYYYMMDD.db

# Linux/Mac
cp ~/.config/fastfood-desktop/database.db backup-$(date +%Y%m%d).db
```

**Restore manuel** :

1. Fermer l'application
2. Remplacer `database.db` par votre backup
3. Relancer l'application

---

## 🔐 Sécurité

### JWT Secret

Généré automatiquement au premier lancement et stocké dans :

```
electron-store → jwtSecret
```

### Base de données

SQLite n'a pas de mot de passe par défaut, mais :

- ✅ Fichiers stockés dans dossier utilisateur (protégé par Windows/macOS/Linux)
- ✅ Pas d'accès réseau (contrairement à PostgreSQL)
- ✅ Isolation par utilisateur système

### Recommandations

1. **Changer le mot de passe admin** après l'installation
2. **Backups réguliers** de la base
3. **Pas de partage** du fichier database.db
4. **Mises à jour** régulières de l'application

---

## 📊 Comparaison des versions

| Critère | Version Web (Docker) | Version Desktop (Electron) |
|---------|---------------------|---------------------------|
| **Installation** | Complexe | Simple |
| **Prérequis** | Docker | Aucun |
| **Taille** | 500 MB - 1 GB | 150-250 MB |
| **Démarrage** | 30-60 secondes | 5-10 secondes |
| **Multi-PC** | Oui (réseau) | Non (standalone) |
| **Base de données** | PostgreSQL | SQLite |
| **Port backend** | 3000 | 3002 |
| **Idéal pour** | Restaurants multi-postes | PC unique, démonstration |

---

## 🎓 Pour aller plus loin

### Personnalisation

**Changer les icônes** :

Placez vos icônes dans `desktop/build/` :
- `icon.ico` (Windows, 256x256)
- `icon.icns` (macOS, 512x512)
- `icon.png` (Linux, 512x512)

**Changer le nom** :

Modifier `desktop/package.json` :
```json
{
  "name": "mon-app",
  "productName": "Mon Application"
}
```

### Signature de code

Pour éviter les avertissements Windows/macOS :

**Windows** : Obtenir un certificat Code Signing
```json
"win": {
  "certificateFile": "cert.pfx",
  "certificatePassword": "password"
}
```

**macOS** : Rejoindre Apple Developer Program
```json
"mac": {
  "identity": "Developer ID Application: Votre Nom (TEAM_ID)"
}
```

### Multi-langue

Ajouter dans `electron/main.js` :
```javascript
const locale = app.getLocale(); // 'fr', 'en', etc.
```

---

## ✅ Checklist de distribution

### Avant de distribuer

- [ ] Version buildée et testée
- [ ] Numéro de version incrémenté
- [ ] Icônes personnalisées ajoutées
- [ ] README de l'utilisateur créé
- [ ] Mot de passe admin par défaut documenté
- [ ] Installateur testé sur PC vierge

### Fichiers à distribuer

- [ ] Installateur Windows (.exe)
- [ ] Installateur macOS (.dmg)
- [ ] Installateur Linux (.AppImage / .deb)
- [ ] Guide d'installation (PDF)
- [ ] Notes de version (CHANGELOG)

---

**Profitez de votre application desktop Fast Food Management ! 🖥️🍔**
