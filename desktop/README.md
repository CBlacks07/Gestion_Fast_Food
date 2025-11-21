# Desktop Application

Application desktop Electron pour Fast Food Management System.

## 🚀 Quick Start

### Build l'application

**Windows** :
```powershell
cd ..
.\build-desktop.ps1
```

**Linux/Mac** :
```bash
cd ..
./build-desktop.sh
```

### Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run electron:dev
```

## 📁 Structure

```
desktop/
├── electron/
│   ├── main.js           # Process principal Electron
│   ├── preload.js        # Script preload (isolation)
│   ├── error.html        # Page d'erreur
│   └── .env.electron     # Config Electron
├── build/                # Icônes de l'application
│   ├── icon.ico          # Windows (256x256)
│   ├── icon.icns         # macOS (512x512)
│   └── icon.png          # Linux (512x512)
├── frontend-dist/        # Frontend build (généré)
├── backend-dist/         # Backend compilé (généré)
├── dist/                 # Installateurs (généré)
└── package.json          # Configuration Electron Builder
```

## ⚙️ Configuration

### Port

L'application utilise le **port 3002** pour le backend.

Pour changer le port, modifier `electron/main.js` :
```javascript
const BACKEND_PORT = 3002; // Ligne 7
```

### Base de données

SQLite embarquée, stockée dans :
- Windows: `%APPDATA%\fastfood-desktop\database.db`
- macOS: `~/Library/Application Support/fastfood-desktop/database.db`
- Linux: `~/.config/fastfood-desktop/database.db`

## 📦 Build Targets

### Windows
```bash
npm run build:win
```
Génère : `Fast Food Management-Setup-{version}.exe`

### macOS
```bash
npm run build:mac
```
Génère : `Fast Food Management-{version}.dmg`

### Linux
```bash
npm run build:linux
```
Génère :
- `Fast-Food-Management-{version}.AppImage`
- `fast-food-management_{version}_amd64.deb`

## 🔧 Customization

### Changer le nom de l'application

Modifier `package.json` :
```json
{
  "name": "mon-app",
  "productName": "Mon Application"
}
```

### Changer les icônes

Placer vos icônes dans `build/` :
- `icon.ico` - Windows
- `icon.icns` - macOS
- `icon.png` - Linux

### Signature de code

**Windows** :
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

**macOS** :
```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAM_ID)"
}
```

## 📚 Documentation complète

Voir [../DESKTOP.md](../DESKTOP.md) pour la documentation complète.

## 🐛 Debug

### Logs de l'application

- Windows: `%APPDATA%\fastfood-desktop\logs\`
- macOS: `~/Library/Logs/fastfood-desktop/`
- Linux: `~/.config/fastfood-desktop/logs/`

### DevTools

En mode développement, les DevTools s'ouvrent automatiquement.

En production, activer avec : `Ctrl+Shift+I` (ou `Cmd+Option+I` sur Mac)

## 🔐 Sécurité

- Context Isolation: ✅ Activé
- Node Integration: ❌ Désactivé
- JWT Secret: Généré automatiquement au premier lancement

## 📊 Performances

### Taille de l'installateur

- Windows: ~150 MB
- macOS: ~180 MB
- Linux: ~160 MB

### Temps de démarrage

- Premier démarrage: 10-15 secondes
- Démarrages suivants: 5-10 secondes

## ⚡ Technologies

- **Electron** v28.1.0 - Framework desktop
- **Electron Builder** v24.9.1 - Packaging
- **Better SQLite3** v9.2.2 - Base de données embarquée
- **Electron Store** v8.1.0 - Stockage persistant

---

Pour toute question, consultez [DESKTOP.md](../DESKTOP.md)
