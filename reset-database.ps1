# Script de reinitialisation de la base de donnees
# ATTENTION: Ce script supprime TOUTES les donnees et ne garde que l'utilisateur admin

Write-Host ""
Write-Host "=============================================" -ForegroundColor Red
Write-Host "  REINITIALISATION DE LA BASE DE DONNEES" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Red
Write-Host ""
Write-Host "[AVERTISSEMENT] Ce script va:" -ForegroundColor Yellow
Write-Host "  - Supprimer TOUTES les donnees de la base" -ForegroundColor Yellow
Write-Host "  - Supprimer tous les utilisateurs" -ForegroundColor Yellow
Write-Host "  - Supprimer tous les produits et categories" -ForegroundColor Yellow
Write-Host "  - Supprimer toutes les commandes et paiements" -ForegroundColor Yellow
Write-Host "  - Supprimer tous les stocks et ingredients" -ForegroundColor Yellow
Write-Host "  - Supprimer toutes les clotures et logs" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Seul l'utilisateur admin sera recree:" -ForegroundColor Green
Write-Host "    Username: admin" -ForegroundColor Green
Write-Host "    Password: admin123" -ForegroundColor Green
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Etes-vous ABSOLUMENT sur de vouloir continuer? (tapez 'OUI' en majuscules pour confirmer)"

if ($confirmation -ne "OUI") {
    Write-Host ""
    Write-Host "[INFO] Operation annulee." -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "[INFO] Demarrage de la reinitialisation..." -ForegroundColor Cyan

# Configuration PostgreSQL
$env:PGPASSWORD = "Admin123"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$DB_NAME = "fastfood_db"

# Verification de la connexion PostgreSQL
Write-Host "[INFO] Verification de la connexion PostgreSQL..." -ForegroundColor Cyan
$testConnection = psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERREUR] Impossible de se connecter a PostgreSQL" -ForegroundColor Red
    Write-Host "Verifiez que:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL est demarre" -ForegroundColor Yellow
    Write-Host "  - Le mot de passe est correct (Admin123)" -ForegroundColor Yellow
    Write-Host "  - La base de donnees 'fastfood_db' existe" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "[OK] Connexion PostgreSQL etablie" -ForegroundColor Green

# Generer le hash bcrypt pour le mot de passe admin123
Write-Host "[INFO] Generation du hash bcrypt pour le mot de passe..." -ForegroundColor Cyan

Set-Location backend

$hashScript = @"
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10, (err, hash) => {
  if (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
  console.log(hash);
  process.exit(0);
});
"@

$passwordHash = node -e $hashScript 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERREUR] Impossible de generer le hash bcrypt" -ForegroundColor Red
    Write-Host "Verifiez que Node.js et bcrypt sont installes" -ForegroundColor Yellow
    Write-Host ""
    Set-Location ..
    exit 1
}

Write-Host "[OK] Hash bcrypt genere" -ForegroundColor Green

# Lire le fichier SQL template
$sqlContent = Get-Content "reset-database.sql" -Raw

# Remplacer le placeholder par le hash reel
$sqlContent = $sqlContent -replace '\$2b\$10\$YourBcryptHashHere', $passwordHash.Trim()

# Creer un fichier SQL temporaire
$tempSqlFile = "reset-database.tmp.sql"
$sqlContent | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "[INFO] Execution du script de reinitialisation..." -ForegroundColor Cyan

# Executer le script SQL
$result = psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $tempSqlFile 2>&1

# Supprimer le fichier temporaire
Remove-Item $tempSqlFile -ErrorAction SilentlyContinue

Set-Location ..

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERREUR] Erreur lors de l'execution du script SQL" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  REINITIALISATION TERMINEE AVEC SUCCES!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Informations de connexion:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "  Email:    admin@fastfood.com" -ForegroundColor White
Write-Host ""
Write-Host "Vous pouvez maintenant:" -ForegroundColor Cyan
Write-Host "  1. Demarrer le backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "  2. Demarrer le frontend: cd frontend && npm run tauri dev" -ForegroundColor White
Write-Host "  3. Vous connecter avec les identifiants ci-dessus" -ForegroundColor White
Write-Host ""
