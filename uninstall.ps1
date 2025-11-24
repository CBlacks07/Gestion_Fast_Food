# Script de désinstallation Gestion Fast Food

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DESINSTALLATION GESTION FAST-FOOD     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$InstallDir = "C:\Program Files\GestionFastFood"

# Vérifier les privilèges administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ Ce script nécessite des privilèges administrateur" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host "⚠️ Cette action va supprimer l'application Gestion Fast-Food" -ForegroundColor Yellow
Write-Host "⚠️ Les données dans la base de données seront conservées (volumes Docker)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Voulez-vous continuer ? (O/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -ne "O" -and $response -ne "o") {
    Write-Host "Désinstallation annulée." -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 0
}

Write-Host ""

# Arrêter l'application
Write-Host "Arrêt de l'application..." -ForegroundColor Yellow
Set-Location $InstallDir
docker-compose down 2>$null
Write-Host "✅ Application arrêtée" -ForegroundColor Green
Write-Host ""

# Supprimer le raccourci du bureau
Write-Host "Suppression du raccourci..." -ForegroundColor Yellow
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = "$desktopPath\Gestion Fast-Food.lnk"
if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "✅ Raccourci supprimé" -ForegroundColor Green
} else {
    Write-Host "⚠️ Raccourci non trouvé" -ForegroundColor Yellow
}
Write-Host ""

# Supprimer le répertoire d'installation
Write-Host "Suppression des fichiers..." -ForegroundColor Yellow
if (Test-Path $InstallDir) {
    Set-Location "C:\"
    Remove-Item $InstallDir -Recurse -Force
    Write-Host "✅ Fichiers supprimés" -ForegroundColor Green
} else {
    Write-Host "⚠️ Répertoire d'installation non trouvé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESINSTALLATION TERMINEE !           " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Note : Les volumes Docker (base de données) ont été conservés." -ForegroundColor Cyan
Write-Host "Pour les supprimer complètement, exécutez : docker volume prune" -ForegroundColor Cyan
Write-Host ""
Read-Host "Appuyez sur Entrée pour quitter"
