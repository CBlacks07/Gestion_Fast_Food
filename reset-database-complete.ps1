# ============================================
# SCRIPT DE RÉINITIALISATION COMPLÈTE DE LA BASE DE DONNÉES (PowerShell)
# ============================================

Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "⚠️  ATTENTION: RÉINITIALISATION COMPLÈTE" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ce script va:"
Write-Host "  - SUPPRIMER toutes les données de la base"
Write-Host "  - Conserver uniquement le compte admin"
Write-Host "  - Réinitialiser les paramètres par défaut"
Write-Host ""

$confirm = Read-Host "Êtes-vous sûr de vouloir continuer? (oui/non)"

if ($confirm -ne "oui") {
    Write-Host "❌ Opération annulée" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Réinitialisation en cours..." -ForegroundColor Cyan
Write-Host ""

# Configuration de la base de données
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "fastfood_db"
$DB_USER = "postgres"

# Demander le mot de passe
$SecurePassword = Read-Host "Mot de passe PostgreSQL" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Définir la variable d'environnement
$env:PGPASSWORD = $Password

# Exécuter le script SQL
& psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f backend/reset-database-complete.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "✅ Réinitialisation terminée avec succès !" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔐 Compte admin:" -ForegroundColor Cyan
    Write-Host "   Username: admin"
    Write-Host "   Password: Admin123"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de la réinitialisation" -ForegroundColor Red
    exit 1
}

# Nettoyer la variable d'environnement
Remove-Item Env:\PGPASSWORD
