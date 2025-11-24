# Script d'installation Gestion Fast Food
# Ce script installe l'application et configure tout automatiquement

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   INSTALLATION GESTION FAST-FOOD       " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$InstallDir = "C:\Program Files\GestionFastFood"

# Vérifier les privilèges administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ Ce script nécessite des privilèges administrateur" -ForegroundColor Red
    Write-Host "Faites un clic droit et choisissez 'Exécuter en tant qu'administrateur'" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host "✅ Privilèges administrateur détectés" -ForegroundColor Green
Write-Host ""

# Étape 1 : Vérifier Docker Desktop
Write-Host "Étape 1/5 : Vérification de Docker Desktop..." -ForegroundColor Yellow
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

if (-not (Test-Path $dockerPath)) {
    Write-Host "❌ Docker Desktop n'est pas installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "Docker Desktop est requis pour cette application." -ForegroundColor Yellow
    Write-Host "Voulez-vous télécharger Docker Desktop maintenant ? (O/N)" -ForegroundColor Cyan
    $response = Read-Host

    if ($response -eq "O" -or $response -eq "o") {
        Write-Host "Ouverture de la page de téléchargement de Docker Desktop..." -ForegroundColor Cyan
        Start-Process "https://www.docker.com/products/docker-desktop"
        Write-Host ""
        Write-Host "Une fois Docker Desktop installé, relancez ce script." -ForegroundColor Yellow
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 0
    } else {
        Write-Host "Installation annulée." -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour quitter"
        exit 1
    }
} else {
    Write-Host "✅ Docker Desktop est installé" -ForegroundColor Green
}

# Vérifier que Docker est en cours d'exécution
$dockerRunning = $false
try {
    $null = docker version 2>$null
    $dockerRunning = $LASTEXITCODE -eq 0
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    Write-Host "⚠️ Docker Desktop n'est pas démarré" -ForegroundColor Yellow
    Write-Host "Démarrage de Docker Desktop..." -ForegroundColor Cyan
    Start-Process $dockerPath
    Write-Host "Veuillez patienter pendant le démarrage de Docker (30 secondes)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
}

Write-Host ""

# Étape 2 : Créer le répertoire d'installation
Write-Host "Étape 2/5 : Création du répertoire d'installation..." -ForegroundColor Yellow
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "✅ Répertoire créé : $InstallDir" -ForegroundColor Green
} else {
    Write-Host "⚠️ Le répertoire existe déjà" -ForegroundColor Yellow
}
Write-Host ""

# Étape 3 : Copier les fichiers
Write-Host "Étape 3/5 : Copie des fichiers de l'application..." -ForegroundColor Yellow
$currentDir = Get-Location
Copy-Item -Path "$currentDir\*" -Destination $InstallDir -Recurse -Force -Exclude ".git","node_modules","dist","build"
Write-Host "✅ Fichiers copiés" -ForegroundColor Green
Write-Host ""

# Étape 4 : Créer les raccourcis
Write-Host "Étape 4/5 : Création des raccourcis..." -ForegroundColor Yellow

# Créer le script de démarrage
$startScript = @"
@echo off
cd /d "$InstallDir"
echo ========================================
echo   DEMARRAGE GESTION FAST-FOOD
echo ========================================
echo.
echo Demarrage des containers Docker...
docker-compose up -d
echo.
echo ========================================
echo   APPLICATION DEMARREE !
echo ========================================
echo.
echo L'application est accessible sur :
echo   http://localhost
echo.
echo Pour arreter l'application, utilisez :
echo   Arreter Gestion Fast-Food
echo.
pause
"@
Set-Content -Path "$InstallDir\Demarrer.bat" -Value $startScript

# Créer le script d'arrêt
$stopScript = @"
@echo off
cd /d "$InstallDir"
echo ========================================
echo   ARRET GESTION FAST-FOOD
echo ========================================
echo.
echo Arret des containers Docker...
docker-compose down
echo.
echo ========================================
echo   APPLICATION ARRETEE !
echo ========================================
echo.
pause
"@
Set-Content -Path "$InstallDir\Arreter.bat" -Value $stopScript

# Créer un raccourci sur le bureau
$WshShell = New-Object -ComObject WScript.Shell
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = "$desktopPath\Gestion Fast-Food.lnk"
$shortcut = $WshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$InstallDir\Demarrer.bat"
$shortcut.WorkingDirectory = $InstallDir
$shortcut.Description = "Gestion Fast-Food - Application de gestion de restaurant"
# Si une icône existe, l'utiliser
if (Test-Path "$InstallDir\icon.ico") {
    $shortcut.IconLocation = "$InstallDir\icon.ico"
}
$shortcut.Save()

Write-Host "✅ Raccourci créé sur le bureau" -ForegroundColor Green
Write-Host ""

# Étape 5 : Initialiser l'application
Write-Host "Étape 5/5 : Initialisation de l'application..." -ForegroundColor Yellow
Set-Location $InstallDir

Write-Host "Construction des containers Docker..." -ForegroundColor Cyan
docker-compose build --no-cache

Write-Host "✅ Application installée avec succès !" -ForegroundColor Green
Write-Host ""

# Demander si l'utilisateur veut démarrer maintenant
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INSTALLATION TERMINEE !             " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Voulez-vous démarrer l'application maintenant ? (O/N)" -ForegroundColor Cyan
$startNow = Read-Host

if ($startNow -eq "O" -or $startNow -eq "o") {
    Write-Host ""
    Write-Host "Démarrage de l'application..." -ForegroundColor Cyan
    docker-compose up -d
    Start-Sleep -Seconds 5

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   APPLICATION DEMARREE !             " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Accédez à l'application sur : http://localhost" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Utilisez le raccourci 'Gestion Fast-Food' sur votre bureau" -ForegroundColor Yellow
    Write-Host "   pour démarrer l'application à l'avenir" -ForegroundColor Yellow
    Write-Host ""

    # Ouvrir le navigateur
    Start-Process "http://localhost"
}

Write-Host ""
Write-Host "Appuyez sur Entrée pour quitter..." -ForegroundColor Gray
Read-Host
