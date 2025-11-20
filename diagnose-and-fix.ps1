# Script PowerShell pour diagnostiquer et corriger les problèmes Docker du backend

Write-Host "=== DIAGNOSTIC DOCKER BACKEND ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Vérification du fichier docker-entrypoint.sh sur le disque:" -ForegroundColor Yellow
Get-ChildItem backend\docker-entrypoint.sh -ErrorAction SilentlyContinue | Format-Table Name, Length, LastWriteTime
Write-Host ""

Write-Host "2. Premières lignes du fichier:" -ForegroundColor Yellow
Get-Content backend\docker-entrypoint.sh -Head 5
Write-Host ""

Write-Host "3. Images Docker actuelles pour le backend:" -ForegroundColor Yellow
docker images | Select-String -Pattern "NAME|backend|gestion"
Write-Host ""

Write-Host "4. Conteneurs actuels:" -ForegroundColor Yellow
docker ps -a | Select-String -Pattern "NAME|fastfood_api"
Write-Host ""

Write-Host "=== NETTOYAGE COMPLET ===" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "Voulez-vous nettoyer complètement et reconstruire? (O/N)"
if ($response -match "^[Oo]$") {
    Write-Host "Arrêt des conteneurs..." -ForegroundColor Green
    docker-compose down

    Write-Host "Suppression du conteneur backend..." -ForegroundColor Green
    docker rm -f fastfood_api 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  -> Déjà supprimé" -ForegroundColor Gray
    }

    Write-Host "Suppression de TOUTES les images du projet..." -ForegroundColor Green
    $images = docker images | Select-String -Pattern "gestion|fastfood" | ForEach-Object { ($_ -split "\s+")[2] }
    if ($images) {
        $images | ForEach-Object { docker rmi -f $_ }
    }

    Write-Host "Nettoyage du cache de build..." -ForegroundColor Green
    docker builder prune -f

    Write-Host ""
    Write-Host "=== RECONSTRUCTION ===" -ForegroundColor Cyan
    Write-Host "Reconstruction du backend (ceci va prendre 2-3 minutes)..." -ForegroundColor Yellow
    docker-compose build --no-cache --progress=plain backend 2>&1 | Tee-Object -FilePath build.log

    Write-Host ""
    Write-Host "Vérification que l'image a été créée:" -ForegroundColor Yellow
    docker images | Select-String -Pattern "backend"

    Write-Host ""
    Write-Host "Le log complet du build a été sauvegardé dans build.log" -ForegroundColor Cyan
    Write-Host "Cherchons docker-entrypoint dans le log:" -ForegroundColor Yellow
    Get-Content build.log | Select-String -Pattern "docker-entrypoint"

    Write-Host ""
    $startResponse = Read-Host "Voulez-vous démarrer les conteneurs maintenant? (O/N)"
    if ($startResponse -match "^[Oo]$") {
        Write-Host ""
        Write-Host "=== DÉMARRAGE DES CONTENEURS ===" -ForegroundColor Cyan
        docker-compose up
    } else {
        Write-Host ""
        Write-Host "Pour démarrer les conteneurs plus tard, exécutez:" -ForegroundColor Yellow
        Write-Host "  docker-compose up" -ForegroundColor White
    }
} else {
    Write-Host "Opération annulée." -ForegroundColor Yellow
}
