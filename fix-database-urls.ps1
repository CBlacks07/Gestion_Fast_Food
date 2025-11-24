# Script PowerShell pour nettoyer les URLs de logo en base de données
# Pour Windows

Write-Host "🗄️ Nettoyage des URLs de logo en base de données..." -ForegroundColor Cyan
Write-Host ""

try {
    # Vérifier que le fichier SQL existe
    if (-not (Test-Path "fix-logo-urls.sql")) {
        Write-Host "❌ ERREUR: Le fichier fix-logo-urls.sql n'existe pas" -ForegroundColor Red
        exit 1
    }

    # Exécuter le script SQL
    Get-Content fix-logo-urls.sql | docker-compose exec -T postgres psql -U fastfood_admin -d fastfood_db

    Write-Host ""
    Write-Host "✅ Base de données nettoyée avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Les anciennes URLs avec 'http://localhost:3002' ont été converties en URLs relatives '/uploads/'" -ForegroundColor Cyan

} catch {
    Write-Host ""
    Write-Host "❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Assurez-vous que les containers Docker sont démarrés" -ForegroundColor Yellow
    exit 1
}
