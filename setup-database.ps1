# Script PowerShell pour configurer la base de données
# Pour Windows

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configuration de la base de données" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si PostgreSQL est accessible
Write-Host "🔄 Vérification de PostgreSQL..." -ForegroundColor Yellow
try {
    $pgReady = pg_isready -h localhost -p 5432 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ PostgreSQL n'est pas accessible" -ForegroundColor Red
        Write-Host ""
        Write-Host "Assurez-vous que PostgreSQL est démarré:" -ForegroundColor Yellow
        Write-Host "  - Via pgAdmin" -ForegroundColor White
        Write-Host "  - Via Services Windows (cherchez 'postgresql')" -ForegroundColor White
        Write-Host "  - Ou avec: net start postgresql-x64-XX (remplacez XX par votre version)" -ForegroundColor White
        exit 1
    }
    Write-Host "✅ PostgreSQL est accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: pg_isready n'est pas trouvé" -ForegroundColor Red
    Write-Host "Assurez-vous que PostgreSQL est installé et dans le PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Vérifier si la base de données existe
Write-Host "🔄 Vérification de la base de données..." -ForegroundColor Yellow
$env:PGPASSWORD = "Admin123"
$dbExists = psql -h localhost -U postgres -lqt 2>&1 | Select-String "fastfood_db"

if (-not $dbExists) {
    Write-Host "📝 Création de la base de données 'fastfood_db'..." -ForegroundColor Yellow
    $result = psql -h localhost -U postgres -c "CREATE DATABASE fastfood_db;" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de données créée" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la création de la base de données" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Base de données 'fastfood_db' existe déjà" -ForegroundColor Green
}

Write-Host ""

# Exécuter la migration
Write-Host "🔄 Exécution de la migration SQL..." -ForegroundColor Yellow
Set-Location backend

$env:PGPASSWORD = "Admin123"
$result = psql -h localhost -U postgres -d fastfood_db -f add_closures_and_logs.sql 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration exécutée avec succès!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  La migration a échoué (peut-être déjà exécutée?)" -ForegroundColor Yellow
    Write-Host $result -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configuration terminée!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous pouvez maintenant:" -ForegroundColor White
Write-Host "1. Démarrer le backend:   cd backend; npm run dev" -ForegroundColor White
Write-Host "2. Démarrer le frontend:  cd frontend; npm run tauri dev" -ForegroundColor White
Write-Host ""
Write-Host "Identifiants par défaut:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
