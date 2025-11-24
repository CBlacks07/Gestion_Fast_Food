# Script PowerShell de reparation complete du logo
# Pour Windows

Write-Host "================================" -ForegroundColor Cyan
Write-Host "REPARATION COMPLETE DU LOGO" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

Write-Host "Etape 1/5: Arret et nettoyage du frontend..." -ForegroundColor Yellow
docker-compose stop frontend 2>$null
docker-compose rm -f frontend 2>$null
docker rmi gestion_fast_food-frontend 2>$null
docker rmi gestion_fast_food_frontend 2>$null
Write-Host "OK - Nettoyage termine" -ForegroundColor Green
Write-Host ""

Write-Host "Etape 2/5: Nettoyage du cache Docker..." -ForegroundColor Yellow
docker builder prune -f
Write-Host "OK - Cache nettoye" -ForegroundColor Green
Write-Host ""

Write-Host "Etape 3/5: Reconstruction du frontend SANS cache..." -ForegroundColor Yellow
Write-Host "(Cela peut prendre quelques minutes)" -ForegroundColor Gray
docker-compose build --no-cache frontend
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Frontend reconstruit" -ForegroundColor Green
} else {
    Write-Host "ERREUR - Le build a echoue" -ForegroundColor Red
    Write-Host "Verifiez que Docker Desktop est demarre" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "Etape 4/5: Redemarrage du frontend..." -ForegroundColor Yellow
docker-compose up -d frontend
Start-Sleep -Seconds 5
Write-Host "OK - Frontend redemarre" -ForegroundColor Green
Write-Host ""

Write-Host "Etape 5/5: Nettoyage des URLs de logo en base de donnees..." -ForegroundColor Yellow
Get-Content fix-logo-urls.sql | docker-compose exec -T postgres psql -U fastfood_admin -d fastfood_db
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Base de donnees nettoyee" -ForegroundColor Green
} else {
    Write-Host "ATTENTION - Erreur lors du nettoyage de la BDD" -ForegroundColor Yellow
    Write-Host "Le frontend fonctionne, mais les anciennes URLs ne sont pas nettoyees" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "REPARATION TERMINEE !" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Cyan
Write-Host "1. Ouvrez votre navigateur"
Write-Host "2. Videz le cache (Ctrl+Shift+Del)"
Write-Host "3. Rafraichissez avec Ctrl+F5"
Write-Host "4. Allez dans Parametres App"
Write-Host "5. Uploadez une nouvelle image"
Write-Host ""
Write-Host "Les logs doivent maintenant montrer :" -ForegroundColor Green
Write-Host "   Upload du logo en cours... [VERSION 2.0 - URL RELATIVE]"
Write-Host "   Logo uploade avec succes. URL: /uploads/logo-xxx.png"
Write-Host "   Type URL: RELATIVE (NOUVEAU CODE!)"
Write-Host ""
Write-Host "Verifier les logs du frontend :" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f frontend"
Write-Host ""
