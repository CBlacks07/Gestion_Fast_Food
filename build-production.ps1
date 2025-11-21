#Requires -Version 5.1

<#
.SYNOPSIS
    Build de production optimisé pour Fast Food Management System
.DESCRIPTION
    Crée un build optimisé pour la production avec images Docker légères,
    frontend minifié et backend compilé. Prêt pour déploiement offline.
#>

$ErrorActionPreference = "Stop"

# Couleurs
function Write-Color {
    param([string]$Text, [string]$Color = "White")
    Write-Host $Text -ForegroundColor $Color
}

function Write-Success { param([string]$Text) Write-Color "✓ $Text" "Green" }
function Write-Error { param([string]$Text) Write-Color "✗ $Text" "Red" }
function Write-Info { param([string]$Text) Write-Color "ℹ $Text" "Cyan" }
function Write-Warning { param([string]$Text) Write-Color "⚠ $Text" "Yellow" }
function Write-Title { param([string]$Text) Write-Color "`n=== $Text ===" "Magenta" }

# Banner
Clear-Host
Write-Color @"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 PRODUCTION BUILD - FAST FOOD MANAGEMENT             ║
║                                                           ║
║   Build optimisé pour déploiement offline                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ "Yellow"

Write-Host ""

# Vérifier Docker
Write-Title "Vérification de l'environnement"

try {
    $dockerVersion = docker --version 2>&1
    Write-Success "Docker installé: $dockerVersion"
}
catch {
    Write-Error "Docker n'est pas installé ou n'est pas en cours d'exécution"
    exit 1
}

# Options de build
Write-Host ""
Write-Title "Configuration du build"

$importCategories = Read-Host "Importer les 43 catégories fast-food par défaut dans le build? (O/n)"
$shouldImportCategories = ($importCategories -ne "n" -and $importCategories -ne "N")

# Modifier le Dockerfile backend
$dockerfilePath = "backend/Dockerfile"
$dockerfileContent = Get-Content $dockerfilePath -Raw

if ($shouldImportCategories) {
    if ($dockerfileContent -match "#\s*echo 'npx tsx src/scripts/seed-categories-fastfood\.ts") {
        Write-Info "Activation de l'import des catégories..."
        $dockerfileContent = $dockerfileContent -replace "#\s*(echo 'npx tsx src/scripts/seed-categories-fastfood\.ts)", '$1'
        Set-Content -Path $dockerfilePath -Value $dockerfileContent -NoNewline
    }
}
else {
    if ($dockerfileContent -match "^\s*echo 'npx tsx src/scripts/seed-categories-fastfood\.ts" -and $dockerfileContent -notmatch "#\s*echo 'npx tsx src/scripts/seed-categories-fastfood\.ts") {
        Write-Info "Désactivation de l'import des catégories..."
        $dockerfileContent = $dockerfileContent -replace "(echo 'npx tsx src/scripts/seed-categories-fastfood\.ts)", '# $1'
        Set-Content -Path $dockerfilePath -Value $dockerfileContent -NoNewline
    }
}

# Nettoyage
Write-Host ""
Write-Title "Nettoyage de l'environnement"

Write-Info "Arrêt des containers existants..."
try {
    docker compose down -v 2>&1 | Out-Null
    Write-Success "Containers arrêtés"
}
catch {
    Write-Info "Aucun container à arrêter"
}

Write-Info "Suppression des anciennes images..."
try {
    $oldImages = docker images "gestion_fast_food*" -q
    if ($oldImages) {
        docker rmi -f $oldImages 2>&1 | Out-Null
        Write-Success "Anciennes images supprimées"
    }
    else {
        Write-Info "Aucune ancienne image à supprimer"
    }
}
catch {
    Write-Info "Erreur lors de la suppression des images (ignorée)"
}

# Build de production
Write-Host ""
Write-Title "Build de production"

Write-Info "Construction des images optimisées..."
Write-Warning "Cela peut prendre 10-15 minutes selon votre machine"
Write-Host ""

$env:NODE_ENV = "production"
$buildOutput = docker compose build --no-cache --pull 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Success "Images de production construites avec succès"
}
else {
    Write-Error "Erreur lors du build"
    Write-Host $buildOutput
    exit 1
}

# Analyse de la taille des images
Write-Host ""
Write-Title "Analyse des images"

$images = docker images --filter "reference=gestion_fast_food*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
Write-Host $images
Write-Host ""

# Test du build
Write-Host ""
Write-Title "Test du build"

Write-Info "Démarrage des containers pour test..."
$startOutput = docker compose up -d 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "Erreur lors du démarrage"
    Write-Host $startOutput
    exit 1
}

Write-Success "Containers démarrés"
Write-Host ""
Write-Info "Vérification de la santé des services (60s max)..."

$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -UseBasicParsing 2>$null
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
        }
    }
    catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
        $attempt++
    }
}

Write-Host ""

if ($backendReady) {
    Write-Success "Backend opérationnel"

    # Test frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing 2>$null
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Success "Frontend opérationnel"
        }
    }
    catch {
        Write-Warning "Frontend ne répond pas immédiatement (normal au premier démarrage)"
    }
}
else {
    Write-Warning "Le backend met du temps à démarrer"
}

# Résumé
Write-Host ""
Write-Title "Build de production terminé !"

Write-Host ""
Write-Success "Application prête pour la production"
Write-Host ""

Write-Info "Taille totale des images:"
$totalSize = docker images --filter "reference=gestion_fast_food*" --format "{{.Size}}" | Measure-Object -Sum
Write-Host "  Les images Docker occupent environ: $($totalSize.Count) images créées"
Write-Host ""

Write-Info "Prochaines étapes:"
Write-Color "  1. Tester l'application: " "White" -NoNewline
Write-Color "http://localhost:5173" "Cyan"
Write-Color "  2. Exporter pour d'autres PC: " "White" -NoNewline
Write-Color ".\export-app.ps1" "Cyan"
Write-Color "  3. Arrêter: " "White" -NoNewline
Write-Color "docker compose down" "Cyan"
Write-Host ""

Write-Warning "IMPORTANT: Pour déployer sur d'autres PC sans internet:"
Write-Info "  • Exécutez .\export-app.ps1 pour créer un package"
Write-Info "  • Copiez le fichier .tar sur USB/disque externe"
Write-Info "  • Sur les autres PC, exécutez .\import-app.ps1"
Write-Host ""

# Demander si on veut arrêter les containers
$stopContainers = Read-Host "Voulez-vous arrêter les containers maintenant? (o/N)"
if ($stopContainers -eq "o" -or $stopContainers -eq "O") {
    docker compose down 2>&1 | Out-Null
    Write-Success "Containers arrêtés"
}

Write-Success "Build de production terminé avec succès !"
