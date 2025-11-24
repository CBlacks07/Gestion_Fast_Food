# Script PowerShell simple - Reconstruction rapide du frontend
# Pour Windows

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "RECONSTRUCTION RAPIDE FRONTEND" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Arret du frontend..." -ForegroundColor Yellow
docker-compose stop frontend

Write-Host "2. Suppression du container..." -ForegroundColor Yellow
docker-compose rm -f frontend

Write-Host "3. Suppression de l'image..." -ForegroundColor Yellow
docker rmi -f gestion_fast_food-frontend 2>$null
docker rmi -f gestion_fast_food_frontend 2>$null

Write-Host "4. Nettoyage du cache Docker..." -ForegroundColor Yellow
docker builder prune -f

Write-Host "5. Reconstruction SANS cache..." -ForegroundColor Yellow
docker-compose build --no-cache frontend

Write-Host "6. Redemarrage..." -ForegroundColor Yellow
docker-compose up -d frontend

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "TERMINE !" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Attendez 5 secondes puis:" -ForegroundColor Cyan
Write-Host "1. Videz le cache du navigateur (Ctrl+Shift+Del)"
Write-Host "2. Rafraichissez avec Ctrl+F5"
Write-Host "3. Uploadez une nouvelle image dans Parametres App"
Write-Host ""
