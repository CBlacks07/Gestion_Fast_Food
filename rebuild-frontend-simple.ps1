# Script PowerShell simple pour reconstruire le frontend
# Pour Windows - Version simplifiée sans modification de la base de données

Write-Host "🔨 Reconstruction du frontend..." -ForegroundColor Cyan

try {
    Write-Host "1. Arrêt du frontend..." -ForegroundColor Yellow
    docker-compose stop frontend

    Write-Host "2. Suppression du container..." -ForegroundColor Yellow
    docker-compose rm -f frontend

    Write-Host "3. Suppression de l'image..." -ForegroundColor Yellow
    docker rmi gestion_fast_food-frontend 2>$null
    docker rmi gestion_fast_food_frontend 2>$null

    Write-Host "4. Nettoyage du cache..." -ForegroundColor Yellow
    docker builder prune -f

    Write-Host "5. Reconstruction SANS cache..." -ForegroundColor Yellow
    docker-compose build --no-cache frontend

    Write-Host "6. Redémarrage..." -ForegroundColor Yellow
    docker-compose up -d frontend

    Write-Host ""
    Write-Host "✅ Frontend reconstruit avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Attendez 5 secondes puis rafraîchissez votre navigateur (Ctrl+F5)" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
