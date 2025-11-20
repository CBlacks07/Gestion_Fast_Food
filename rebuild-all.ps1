# Script PowerShell pour reconstruire complètement le projet

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  RECONSTRUCTION COMPLETE DU PROJET" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "ETAPE 1/7: Arrêt des conteneurs..." -ForegroundColor Yellow
docker-compose down
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 2/7: Suppression des conteneurs..." -ForegroundColor Yellow
docker rm -f fastfood_api fastfood_web fastfood_db 2>$null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 3/7: Suppression des images..." -ForegroundColor Yellow
docker rmi -f gestion_fast_food-backend gestion_fast_food-frontend 2>$null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 4/7: Nettoyage du cache..." -ForegroundColor Yellow
docker builder prune -f
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 5/7: Reconstruction du BACKEND..." -ForegroundColor Yellow
Write-Host "(Ceci va prendre 2-3 minutes...)" -ForegroundColor Gray
docker-compose build --no-cache --pull backend
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Backend build réussi!" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Le build backend a échoué!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "ETAPE 6/7: Reconstruction du FRONTEND..." -ForegroundColor Yellow
Write-Host "(Ceci va prendre 1-2 minutes...)" -ForegroundColor Gray
docker-compose build --no-cache --pull frontend
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Frontend build réussi!" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Le build frontend a échoué!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "ETAPE 7/7: Démarrage des services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE EN COURS..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous devriez voir:" -ForegroundColor White
Write-Host "  fastfood_api | FastFood API - Starting..." -ForegroundColor Gray
Write-Host "  fastfood_api | Database connected!" -ForegroundColor Gray
Write-Host "  fastfood_api | Initialization complete!" -ForegroundColor Gray
Write-Host ""
Write-Host "Puis ouvrez: http://localhost" -ForegroundColor Cyan
Write-Host "Identifiants: admin / Admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

docker-compose up
