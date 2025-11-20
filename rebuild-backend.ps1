# Script PowerShell pour forcer la reconstruction complète du backend

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  RECONSTRUCTION BACKEND FAST-FOOD" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "ETAPE 1/6: Arrêt des conteneurs..." -ForegroundColor Yellow
docker-compose down
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 2/6: Suppression du conteneur backend..." -ForegroundColor Yellow
docker rm -f fastfood_api 2>$null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 3/6: Suppression des images du projet..." -ForegroundColor Yellow
docker rmi gestion_fast_food-backend 2>$null
docker rmi gestion-fast-food-backend 2>$null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 4/6: Nettoyage du cache de build..." -ForegroundColor Yellow
docker builder prune -f
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 5/6: Reconstruction COMPLETE du backend..." -ForegroundColor Yellow
Write-Host "(Ceci va prendre 2-3 minutes...)" -ForegroundColor Gray
docker-compose build --no-cache --pull backend
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Build réussi!" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Le build a échoué!" -ForegroundColor Red
    Write-Host "Consultez les logs ci-dessus pour plus de détails." -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "ETAPE 6/6: Démarrage des services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE EN COURS..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous devriez voir:" -ForegroundColor White
Write-Host "  fastfood_api | FastFood API - Starting..." -ForegroundColor Gray
Write-Host "  fastfood_api | Waiting for database..." -ForegroundColor Gray
Write-Host "  fastfood_api | Database connected!" -ForegroundColor Gray
Write-Host "  fastfood_api | Initialization complete!" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter les conteneurs" -ForegroundColor Yellow
Write-Host ""

docker-compose up
