# Script PowerShell pour configurer la base de donnees
# Pour Windows

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configuration de la base de donnees" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verifier si PostgreSQL est accessible
Write-Host "[INFO] Verification de PostgreSQL..." -ForegroundColor Yellow
try {
    $pgReady = pg_isready -h localhost -p 5432 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] PostgreSQL n'est pas accessible" -ForegroundColor Red
        Write-Host ""
        Write-Host "Assurez-vous que PostgreSQL est demarre:" -ForegroundColor Yellow
        Write-Host "  - Via pgAdmin" -ForegroundColor White
        Write-Host "  - Via Services Windows (cherchez 'postgresql')" -ForegroundColor White
        Write-Host "  - Ou avec: net start postgresql-x64-XX (remplacez XX par votre version)" -ForegroundColor White
        exit 1
    }
    Write-Host "[OK] PostgreSQL est accessible" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] pg_isready n'est pas trouve" -ForegroundColor Red
    Write-Host "Assurez-vous que PostgreSQL est installe et dans le PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verifier si la base de donnees existe
Write-Host "[INFO] Verification de la base de donnees..." -ForegroundColor Yellow
$env:PGPASSWORD = "Admin123"
$dbExists = psql -h localhost -U postgres -lqt 2>&1 | Select-String "fastfood_db"

if (-not $dbExists) {
    Write-Host "[INFO] Creation de la base de donnees 'fastfood_db'..." -ForegroundColor Yellow
    $result = psql -h localhost -U postgres -c "CREATE DATABASE fastfood_db;" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Base de donnees creee" -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Erreur lors de la creation de la base de donnees" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Base de donnees 'fastfood_db' existe deja" -ForegroundColor Green
}

Write-Host ""

# Executer la migration
Write-Host "[INFO] Execution de la migration SQL..." -ForegroundColor Yellow
Set-Location backend

$env:PGPASSWORD = "Admin123"
$result = psql -h localhost -U postgres -d fastfood_db -f add_closures_and_logs.sql 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Migration executee avec succes!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[AVERTISSEMENT] La migration a echoue (peut-etre deja executee?)" -ForegroundColor Yellow
    Write-Host $result -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configuration terminee!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous pouvez maintenant:" -ForegroundColor White
Write-Host "1. Demarrer le backend:   cd backend; npm run dev" -ForegroundColor White
Write-Host "2. Demarrer le frontend:  cd frontend; npm run tauri dev" -ForegroundColor White
Write-Host ""
Write-Host "Identifiants par defaut:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
