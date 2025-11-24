# Script PowerShell de réparation complète du logo
# Pour Windows

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🔧 RÉPARATION COMPLÈTE DU LOGO" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Arrêter en cas d'erreur
$ErrorActionPreference = "Stop"

try {
    Write-Host "📦 Étape 1/5: Arrêt et nettoyage du frontend..." -ForegroundColor Yellow
    docker-compose stop frontend 2>$null
    docker-compose rm -f frontend 2>$null
    docker rmi gestion_fast_food-frontend 2>$null
    docker rmi gestion_fast_food_frontend 2>$null
    Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
    Write-Host ""

    Write-Host "🗑️ Étape 2/5: Nettoyage du cache Docker..." -ForegroundColor Yellow
    docker builder prune -f
    Write-Host "✅ Cache nettoyé" -ForegroundColor Green
    Write-Host ""

    Write-Host "🔨 Étape 3/5: Reconstruction du frontend SANS cache (cela peut prendre quelques minutes)..." -ForegroundColor Yellow
    docker-compose build --no-cache frontend
    Write-Host "✅ Frontend reconstruit" -ForegroundColor Green
    Write-Host ""

    Write-Host "🚀 Étape 4/5: Redémarrage du frontend..." -ForegroundColor Yellow
    docker-compose up -d frontend
    Start-Sleep -Seconds 5
    Write-Host "✅ Frontend redémarré" -ForegroundColor Green
    Write-Host ""

    Write-Host "🗄️ Étape 5/5: Nettoyage des URLs de logo en base de données..." -ForegroundColor Yellow
    Get-Content fix-logo-urls.sql | docker-compose exec -T postgres psql -U fastfood_admin -d fastfood_db
    Write-Host "✅ Base de données nettoyée" -ForegroundColor Green
    Write-Host ""

    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "✅ RÉPARATION TERMINÉE !" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "1. Ouvrez votre navigateur"
    Write-Host "2. Videz le cache (Ctrl+Shift+Del)"
    Write-Host "3. Rafraîchissez avec Ctrl+F5"
    Write-Host "4. Allez dans Paramètres App"
    Write-Host "5. Uploadez une nouvelle image"
    Write-Host ""
    Write-Host "✅ Les logs doivent maintenant montrer :" -ForegroundColor Green
    Write-Host "   🔄 Upload du logo en cours... [VERSION 2.0 - URL RELATIVE]"
    Write-Host "   ✅ Logo uploadé avec succès. URL: /uploads/logo-xxx.png"
    Write-Host "   🎯 Type URL: ✅ RELATIVE (NOUVEAU CODE!)"
    Write-Host ""
    Write-Host "📊 Vérifier les logs du frontend :" -ForegroundColor Cyan
    Write-Host "   docker-compose logs -f frontend"
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Si Docker Desktop n'est pas démarré, lancez-le puis réessayez." -ForegroundColor Yellow
    exit 1
}
