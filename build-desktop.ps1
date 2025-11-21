#Requires -Version 5.1

<#
.SYNOPSIS
    Build de l'application desktop Fast Food Management
.DESCRIPTION
    Crée une application desktop standalone (.exe) avec Electron
    incluant le frontend, backend et base de données embarquée.
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
║   🖥️  BUILD DESKTOP - FAST FOOD MANAGEMENT               ║
║                                                           ║
║   Création de l'application desktop Electron             ║
║   Port: 3002 | Format: .exe Windows                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ "Yellow"

Write-Host ""

# Vérifier Node.js
Write-Title "Vérification des prérequis"

try {
    $nodeVersion = node --version 2>&1
    Write-Success "Node.js installé: $nodeVersion"
}
catch {
    Write-Error "Node.js n'est pas installé"
    Write-Info "Installez Node.js depuis: https://nodejs.org/"
    exit 1
}

try {
    $npmVersion = npm --version 2>&1
    Write-Success "npm installé: v$npmVersion"
}
catch {
    Write-Error "npm n'est pas installé"
    exit 1
}

# Vérifier la structure du projet
if (-not (Test-Path "frontend") -or -not (Test-Path "backend")) {
    Write-Error "Structure de projet invalide. Exécutez depuis la racine du projet."
    exit 1
}

Write-Success "Structure du projet valide"

# Nettoyer les anciens builds
Write-Host ""
Write-Title "Nettoyage des anciens builds"

$foldersToClean = @(
    "desktop/frontend-dist",
    "desktop/backend-dist",
    "desktop/dist",
    "desktop/build"
)

foreach ($folder in $foldersToClean) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
        Write-Info "  • $folder supprimé"
    }
}

Write-Success "Nettoyage terminé"

# Build du Frontend
Write-Host ""
Write-Title "Build du Frontend"

Write-Info "Configuration du frontend pour le port 3002..."

# Modifier temporairement le .env du frontend
$frontendEnv = @"
VITE_API_URL=http://localhost:3002
"@

$frontendEnv | Out-File -FilePath "frontend/.env.production" -Encoding UTF8

Write-Info "Construction du frontend (optimisé pour production)..."
Push-Location frontend

try {
    # Installer les dépendances si nécessaire
    if (-not (Test-Path "node_modules")) {
        Write-Info "Installation des dépendances frontend..."
        npm install 2>&1 | Out-Null
    }

    # Build
    npm run build 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend build avec succès"
    }
    else {
        throw "Erreur lors du build du frontend"
    }
}
finally {
    Pop-Location
}

# Copier le build du frontend
if (-not (Test-Path "desktop/frontend-dist")) {
    New-Item -ItemType Directory -Path "desktop/frontend-dist" | Out-Null
}

Copy-Item -Path "frontend/dist/*" -Destination "desktop/frontend-dist" -Recurse -Force
Write-Success "Frontend copié vers desktop/frontend-dist"

# Build du Backend
Write-Host ""
Write-Title "Build du Backend"

Write-Info "Compilation du backend TypeScript..."
Push-Location backend

try {
    # Installer les dépendances si nécessaire
    if (-not (Test-Path "node_modules")) {
        Write-Info "Installation des dépendances backend..."
        npm install 2>&1 | Out-Null
    }

    # Compiler TypeScript
    npx tsc 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend compilé avec succès"
    }
    else {
        throw "Erreur lors de la compilation du backend"
    }
}
finally {
    Pop-Location
}

# Copier le backend compilé
if (-not (Test-Path "desktop/backend-dist")) {
    New-Item -ItemType Directory -Path "desktop/backend-dist" | Out-Null
}

Write-Info "Copie du backend compilé..."
Copy-Item -Path "backend/dist/*" -Destination "desktop/backend-dist" -Recurse -Force
Copy-Item -Path "backend/package.json" -Destination "desktop/backend-dist/" -Force
Copy-Item -Path "backend/prisma" -Destination "desktop/backend-dist/" -Recurse -Force

# Installer les dépendances de production du backend
Push-Location desktop/backend-dist
Write-Info "Installation des dépendances backend (production seulement)..."
npm install --production 2>&1 | Out-Null
Pop-Location

Write-Success "Backend copié vers desktop/backend-dist"

# Installation des dépendances Electron
Write-Host ""
Write-Title "Configuration Electron"

Push-Location desktop

if (-not (Test-Path "node_modules")) {
    Write-Info "Installation des dépendances Electron..."
    npm install 2>&1 | Out-Null
}

Write-Success "Dépendances Electron installées"

# Créer les icônes (placeholder si elles n'existent pas)
if (-not (Test-Path "build")) {
    New-Item -ItemType Directory -Path "build" | Out-Null
    Write-Warning "Dossier build créé. Ajoutez icon.ico, icon.icns, icon.png pour les icônes"
}

# Build de l'application Electron
Write-Host ""
Write-Title "Build de l'application Electron"

Write-Info "Création de l'installateur Windows..."
Write-Warning "Cela peut prendre 5-10 minutes..."
Write-Host ""

$buildOutput = npm run build:win 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "Application Electron buildée avec succès"
}
else {
    Write-Error "Erreur lors du build Electron"
    Write-Host $buildOutput
    Pop-Location
    exit 1
}

Pop-Location

# Résumé
Write-Host ""
Write-Title "Build terminé avec succès !"

Write-Host ""
Write-Success "Application desktop créée"
Write-Host ""

# Trouver l'installateur
$installer = Get-ChildItem -Path "desktop/dist" -Filter "*.exe" -Recurse | Select-Object -First 1

if ($installer) {
    $installerSize = [math]::Round($installer.Length / 1MB, 2)

    Write-Info "Installateur Windows:"
    Write-Color "  Fichier: " "White" -NoNewline
    Write-Color "$($installer.Name)" "Cyan"
    Write-Color "  Emplacement: " "White" -NoNewline
    Write-Color "$($installer.DirectoryName)" "Cyan"
    Write-Color "  Taille: " "White" -NoNewline
    Write-Color "$installerSize MB" "Cyan"
    Write-Host ""

    Write-Info "Caractéristiques:"
    Write-Host "  • Application standalone (pas besoin de Docker)"
    Write-Host "  • Backend sur le port 3002"
    Write-Host "  • Base de données SQLite embarquée"
    Write-Host "  • Fonctionne 100% offline"
    Write-Host "  • Icône sur le bureau et menu démarrer"
    Write-Host ""

    Write-Info "Installation:"
    Write-Host "  1. Double-cliquez sur l'installateur"
    Write-Host "  2. Suivez l'assistant d'installation"
    Write-Host "  3. Lancez depuis le raccourci bureau"
    Write-Host ""

    Write-Warning "IMPORTANT:"
    Write-Info "  • L'installateur est dans: desktop/dist/"
    Write-Info "  • Partagez le fichier .exe pour distribution"
    Write-Info "  • Première connexion: admin@fastfood.com / admin123"
    Write-Host ""
}
else {
    Write-Warning "Installateur non trouvé dans desktop/dist/"
}

$openFolder = Read-Host "Voulez-vous ouvrir le dossier de sortie? (O/n)"
if ($openFolder -ne "n" -and $openFolder -ne "N") {
    Start-Process "desktop/dist"
}

Write-Host ""
Write-Success "Build desktop terminé !"
