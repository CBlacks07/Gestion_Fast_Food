# Script PowerShell pour nettoyer les URLs de logo en base de donnees
# Pour Windows

Write-Host ""
Write-Host "Nettoyage des URLs de logo en base de donnees..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "fix-logo-urls.sql")) {
    Write-Host "ERREUR: Le fichier fix-logo-urls.sql n'existe pas" -ForegroundColor Red
    exit 1
}

Get-Content fix-logo-urls.sql | docker-compose exec -T postgres psql -U fastfood_admin -d fastfood_db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Base de donnees nettoyee avec succes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Les anciennes URLs avec 'http://localhost:3002' ont ete converties en URLs relatives '/uploads/'" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERREUR lors du nettoyage de la base de donnees" -ForegroundColor Red
    Write-Host "Assurez-vous que les containers Docker sont demarres" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
