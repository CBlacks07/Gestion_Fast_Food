#Requires -Version 5.1

<#
.SYNOPSIS
    Exporte l'application Fast Food pour déploiement offline
.DESCRIPTION
    Crée un package contenant les images Docker et les fichiers nécessaires
    pour déployer l'application sur d'autres PC sans connexion internet.
#>

$ErrorActionPreference = "Stop"

# Couleurs
function Write-Color {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Write-Success { param([string]$Text) Write-Color "✓ $Text" "Green" }
function Write-Error { param([string]$Text) Write-Color "✗ $Text" "Red" }
function Write-Info { param([string]$Text) Write-Color "ℹ $Text" "Cyan" }
function Write-Warning { param([string]$Text) Write-Color "⚠ $Text" "Yellow" }
function Write-Title { param([string]$Text) Write-Color "`n=== $Text ===" "Magenta" }

# Banner
Clear-Host
Write-Color @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   📦 EXPORT APPLICATION - DÉPLOIEMENT OFFLINE            ║
║                                                           ║
║   Création d'un package portable pour autres PC          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ "Yellow"

Write-Host ""

# Vérifier Docker
Write-Title "Vérification"

try {
    docker --version 2>&1 | Out-Null
}
catch {
    Write-Error "Docker n'est pas installé ou n'est pas en cours d'exécution"
    exit 1
}

# Vérifier que les images existent
$images = docker images "gestion_fast_food*" -q
if (-not $images) {
    Write-Error "Aucune image Fast Food trouvée"
    Write-Info "Exécutez d'abord: .\build-production.ps1"
    exit 1
}

Write-Success "Images Docker trouvées"

# Créer le dossier d'export
$exportDir = "fastfood-export"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$exportFile = "fastfood-app-$timestamp.tar"

if (Test-Path $exportDir) {
    Remove-Item -Recurse -Force $exportDir
}

New-Item -ItemType Directory -Path $exportDir | Out-Null
Write-Success "Dossier d'export créé: $exportDir"

# Export des images Docker
Write-Host ""
Write-Title "Export des images Docker"

Write-Info "Sauvegarde des images (cela peut prendre plusieurs minutes)..."
Write-Warning "Taille attendue: 500MB - 2GB selon la configuration"
Write-Host ""

$imageNames = @(
    "gestion_fast_food-frontend",
    "gestion_fast_food-backend",
    "gestion_fast_food-backup"
)

try {
    $imageList = $imageNames -join " "
    docker save -o "$exportDir\$exportFile" $imageList 2>&1 | Out-Null
    Write-Success "Images Docker exportées: $exportFile"
}
catch {
    Write-Error "Erreur lors de l'export des images"
    exit 1
}

# Copier les fichiers de configuration
Write-Host ""
Write-Title "Copie des fichiers de configuration"

$filesToCopy = @(
    "docker-compose.yml",
    ".env.example",
    "import-app.ps1",
    "import-app.sh",
    "backup-database.ps1",
    "backup-database.sh",
    "restore-database.ps1",
    "restore-database.sh",
    "SETUP.md",
    "BACKUP.md"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $exportDir
        Write-Info "  • $file"
    }
}

# Créer .env.example s'il n'existe pas
if (-not (Test-Path ".env.example")) {
    @"
# Base de données PostgreSQL
POSTGRES_USER=fastfood_user
POSTGRES_PASSWORD=CHANGEZ_MOI
POSTGRES_DB=fastfood_db
DATABASE_URL=postgresql://fastfood_user:CHANGEZ_MOI@postgres:5432/fastfood_db

# Backend API
PORT=3000
JWT_SECRET=GENERER_SECRET_ALEATOIRE
NODE_ENV=production

# Frontend
VITE_API_URL=http://localhost:3000
"@ | Out-File -FilePath "$exportDir\.env.example" -Encoding UTF8
}

Write-Success "Fichiers de configuration copiés"

# Créer le README d'installation
Write-Host ""
Write-Title "Création du guide d'installation"

@"
# 🍔 Fast Food Management System - Installation Offline

## 📦 Contenu du package

Ce package contient tout le nécessaire pour installer l'application sur un PC sans connexion internet :

- Images Docker pré-construites
- Fichiers de configuration
- Scripts d'installation et de gestion
- Documentation

## 🚀 Installation rapide

### Windows

1. **Installer Docker Desktop** (si pas déjà fait)
   - Télécharger depuis: https://www.docker.com/products/docker-desktop
   - Installer et redémarrer l'ordinateur
   - Vérifier que Docker Desktop est en cours d'exécution

2. **Importer l'application**
   ```powershell
   .\import-app.ps1
   ```

3. **Configurer l'environnement**
   - Le script vous guidera pour créer le fichier .env
   - Définissez un mot de passe PostgreSQL sécurisé

4. **Démarrer l'application**
   ```powershell
   docker compose up -d
   ```

5. **Accéder à l'application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000
   - Identifiants par défaut:
     - Email: admin@fastfood.com
     - Mot de passe: admin123

### Linux / macOS

1. **Installer Docker** (si pas déjà fait)
   - Suivre: https://docs.docker.com/get-docker/

2. **Importer l'application**
   ```bash
   chmod +x import-app.sh
   ./import-app.sh
   ```

3. **Configurer et démarrer**
   ```bash
   docker compose up -d
   ```

## 📋 Informations importantes

- **Changez le mot de passe admin** après la première connexion
- **Backups automatiques** toutes les 12 heures dans ./backups/
- **Pour arrêter**: ``docker compose down``
- **Pour redémarrer**: ``docker compose restart``

## 🆘 Support

Consultez SETUP.md et BACKUP.md pour plus de détails.

---

Package créé le: $(Get-Date -Format "dd/MM/yyyy à HH:mm")
"@ | Out-File -FilePath "$exportDir\README.txt" -Encoding UTF8

Write-Success "Guide d'installation créé"

# Calculer la taille totale
Write-Host ""
Write-Title "Résumé de l'export"

$totalSize = (Get-ChildItem -Path $exportDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ""
Write-Info "Emplacement: $exportDir\"
Write-Info "Taille totale: $([math]::Round($totalSize, 2)) MB"
Write-Info "Fichier principal: $exportFile"
Write-Host ""

# Instructions finales
Write-Title "Export terminé avec succès !"

Write-Host ""
Write-Success "Package prêt pour le transfert"
Write-Host ""

Write-Info "Prochaines étapes:"
Write-Host ""
Write-Color "  1. Copiez le dossier '$exportDir' sur:" "White"
Write-Color "     • Clé USB" "Yellow"
Write-Color "     • Disque dur externe" "Yellow"
Write-Color "     • Réseau local" "Yellow"
Write-Host ""
Write-Color "  2. Sur le PC de destination:" "White"
Write-Color "     • Copiez le dossier complet" "Yellow"
Write-Color "     • Exécutez: .\import-app.ps1 (Windows)" "Yellow"
Write-Color "     • Ou: ./import-app.sh (Linux/Mac)" "Yellow"
Write-Host ""

Write-Warning "IMPORTANT:"
Write-Info "  • Docker doit être installé sur le PC de destination"
Write-Info "  • Le package contient TOUTES les images nécessaires"
Write-Info "  • Aucune connexion internet requise après l'import"
Write-Host ""

# Demander si on veut compresser
$compress = Read-Host "Voulez-vous compresser le dossier en ZIP? (o/N)"
if ($compress -eq "o" -or $compress -eq "O") {
    Write-Info "Compression en cours..."
    $zipFile = "fastfood-app-$timestamp.zip"
    Compress-Archive -Path $exportDir -DestinationPath $zipFile -Force
    Write-Success "Archive créée: $zipFile"
    $zipSize = (Get-Item $zipFile).Length / 1MB
    Write-Info "Taille du ZIP: $([math]::Round($zipSize, 2)) MB"
}

Write-Host ""
Write-Success "Export terminé !"
