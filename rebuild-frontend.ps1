# Script PowerShell pour reconstruire seulement le frontend

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  RECONSTRUCTION FRONTEND UNIQUEMENT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "ETAPE 1/5: Arrêt du conteneur frontend..." -ForegroundColor Yellow
docker stop fastfood_web 2>$null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 2/5: Suppression du conteneur frontend..." -ForegroundColor Yellow
docker rm -f fastfood_web 2>$null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 3/5: Suppression de l'image frontend..." -ForegroundColor Yellow
docker rmi -f gestion_fast_food-frontend 2>$null
Write-Host "OK" -ForegroundColor Green
Write-Host ""

Write-Host "ETAPE 4/5: Reconstruction du frontend..." -ForegroundColor Yellow
Write-Host "(Ceci va prendre 1-2 minutes...)" -ForegroundColor Gray
docker-compose build --no-cache frontend
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Frontend build réussi!" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Le build a échoué!" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "ETAPE 5/5: Redémarrage de tous les services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Une fois demarré, ouvrez: http://localhost" -ForegroundColor Cyan
Write-Host "Identifiants: admin / Admin123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

docker-compose up
