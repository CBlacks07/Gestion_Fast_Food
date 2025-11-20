# Script PowerShell pour restaurer une sauvegarde de la base de données

param(
    [string]$BackupFile = ""
)

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  RESTAURATION DE LA BASE DE DONNEES" -ForegroundColor Cyan
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

# Lister les sauvegardes disponibles
Write-Host "Sauvegardes disponibles:" -ForegroundColor Yellow
Write-Host ""

$backups = Get-ChildItem -Path ".\backups\fastfood_backup_*.sql" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending

if ($backups.Count -eq 0) {
    Write-Host "Aucune sauvegarde trouvee dans .\backups\" -ForegroundColor Red
    Write-Host "Veuillez d'abord creer une sauvegarde avec: .\backup-database.ps1" -ForegroundColor Yellow
    exit 1
}

$index = 1
$backups | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  [$index] $($_.Name) - ${size} MB - $($_.LastWriteTime)" -ForegroundColor Gray
    $index++
}

Write-Host ""

# Si aucun fichier n'est spécifié, demander à l'utilisateur
if (-not $BackupFile) {
    $choice = Read-Host "Choisissez une sauvegarde (1-$($backups.Count)) ou entrez le nom complet (vide = derniere)"

    if ($choice -eq "") {
        $BackupFile = $backups[0].Name
        Write-Host "Utilisation de la derniere sauvegarde: $BackupFile" -ForegroundColor Cyan
    } elseif ($choice -match '^\d+$' -and [int]$choice -ge 1 -and [int]$choice -le $backups.Count) {
        $BackupFile = $backups[[int]$choice - 1].Name
        Write-Host "Sauvegarde selectionnee: $BackupFile" -ForegroundColor Cyan
    } else {
        $BackupFile = $choice
    }
}

# Vérifier que le fichier existe
if (-not (Test-Path ".\backups\$BackupFile")) {
    Write-Host "ERREUR: Fichier de sauvegarde introuvable: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "ATTENTION: Cette operation va REMPLACER TOUTES LES DONNEES actuelles!" -ForegroundColor Red
Write-Host "Fichier de sauvegarde: $BackupFile" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Etes-vous sur de vouloir continuer? (oui/non)"

if ($confirm -ne "oui") {
    Write-Host "Restauration annulee" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Demarrage de la restauration..." -ForegroundColor Yellow
Write-Host ""

# Arrêter le backend pour éviter les connexions actives
Write-Host "Arret du backend..." -ForegroundColor Yellow
docker stop fastfood_api 2>$null

# Exécuter le script de restore dans le conteneur
docker exec fastfood_backup /usr/local/bin/restore.sh "/backups/$BackupFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Redemarrage du backend..." -ForegroundColor Yellow
    docker start fastfood_api

    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "  RESTAURATION TERMINEE" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "La base de donnees a ete restauree avec succes!" -ForegroundColor Green
    Write-Host "Fichier utilise: $BackupFile" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERREUR: La restauration a echoue" -ForegroundColor Red
    Write-Host "Redemarrage du backend..." -ForegroundColor Yellow
    docker start fastfood_api
    exit 1
}
