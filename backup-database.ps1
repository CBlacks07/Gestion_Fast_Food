# Script PowerShell pour créer une sauvegarde manuelle de la base de données

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  SAUVEGARDE DE LA BASE DE DONNEES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Docker est en cours d'exécution
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Docker n'est pas en cours d'execution" -ForegroundColor Red
    Write-Host "Veuillez demarrer Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le conteneur de backup existe
$backupContainer = docker ps -a --filter "name=fastfood_backup" --format "{{.Names}}"
if (-not $backupContainer) {
    Write-Host "ERREUR: Le conteneur de backup n'existe pas" -ForegroundColor Red
    Write-Host "Veuillez d'abord demarrer les services avec: docker-compose up" -ForegroundColor Yellow
    exit 1
}

Write-Host "Demarrage de la sauvegarde..." -ForegroundColor Yellow
Write-Host ""

# Exécuter le script de backup dans le conteneur
docker exec fastfood_backup /usr/local/bin/backup.sh

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  SAUVEGARDE TERMINEE" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Les sauvegardes sont stockees dans:" -ForegroundColor White
    Write-Host "  .\backups\" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Liste des sauvegardes:" -ForegroundColor White
    Get-ChildItem -Path ".\backups\fastfood_backup_*.sql" -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 5 |
        ForEach-Object {
            $size = [math]::Round($_.Length / 1MB, 2)
            Write-Host "  $($_.Name) - ${size} MB - $($_.LastWriteTime)" -ForegroundColor Gray
        }
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERREUR: La sauvegarde a echoue" -ForegroundColor Red
    exit 1
}
