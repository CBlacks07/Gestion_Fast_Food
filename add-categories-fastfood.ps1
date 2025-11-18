# ==================================================
# SCRIPT D'AJOUT DES CATEGORIES FAST-FOOD
# ==================================================
# Ce script execute le fichier SQL pour ajouter les categories
# Date: 2025-01-18
# ==================================================

Write-Host "=============================================="
Write-Host "AJOUT DES CATEGORIES FAST-FOOD"
Write-Host "=============================================="
Write-Host ""
Write-Host "Ce script va ajouter 43 categories de fast-food"
Write-Host "avec des emojis et descriptions"
Write-Host ""

# Charger les variables d'environnement depuis .env
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2].Trim('"')
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "Variables d'environnement chargees depuis .env" -ForegroundColor Green
} else {
    Write-Host "ATTENTION: Fichier .env introuvable" -ForegroundColor Red
    Write-Host "Veuillez creer un fichier .env avec DATABASE_URL" -ForegroundColor Red
    exit 1
}

# Extraire les informations de connexion depuis DATABASE_URL
$DATABASE_URL = [Environment]::GetEnvironmentVariable("DATABASE_URL")
if (-not $DATABASE_URL) {
    Write-Host "ERREUR: DATABASE_URL non definie" -ForegroundColor Red
    exit 1
}

# Parser l'URL PostgreSQL
if ($DATABASE_URL -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
    $PGUSER = $matches[1]
    $PGPASSWORD = $matches[2]
    $PGHOST = $matches[3]
    $PGPORT = $matches[4]
    $PGDATABASE = $matches[5]

    Write-Host "Connexion a la base de donnees:" -ForegroundColor Cyan
    Write-Host "  Host: $PGHOST"
    Write-Host "  Port: $PGPORT"
    Write-Host "  Database: $PGDATABASE"
    Write-Host "  User: $PGUSER"
    Write-Host ""
} else {
    Write-Host "ERREUR: Format DATABASE_URL invalide" -ForegroundColor Red
    exit 1
}

# Definir les variables d'environnement PostgreSQL
$env:PGHOST = $PGHOST
$env:PGPORT = $PGPORT
$env:PGDATABASE = $PGDATABASE
$env:PGUSER = $PGUSER
$env:PGPASSWORD = $PGPASSWORD

# Confirmer l'execution
$confirm = Read-Host "Voulez-vous ajouter les categories? (oui/non)"
if ($confirm -ne "oui") {
    Write-Host "Operation annulee" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Ajout des categories en cours..." -ForegroundColor Yellow

# Executer le script SQL
$sqlFile = "backend\add-categories-fastfood.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERREUR: Fichier $sqlFile introuvable" -ForegroundColor Red
    exit 1
}

try {
    psql -f $sqlFile 2>&1 | Tee-Object -Variable output

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=============================================="
        Write-Host "CATEGORIES AJOUTEES AVEC SUCCES!" -ForegroundColor Green
        Write-Host "=============================================="
        Write-Host ""
        Write-Host "Vous pouvez maintenant:" -ForegroundColor Cyan
        Write-Host "  1. Vous connecter a l'interface admin"
        Write-Host "  2. Aller dans Gestion > Categories"
        Write-Host "  3. Desactiver les categories dont vous n'avez pas besoin"
        Write-Host "  4. Ajouter vos produits dans chaque categorie"
        Write-Host ""
    } else {
        Write-Host "ERREUR lors de l'ajout des categories" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
} catch {
    Write-Host "ERREUR: $_" -ForegroundColor Red
    exit 1
}
