#Requires -Version 5.1

<#
.SYNOPSIS
    Setup automatique multiplateforme pour Fast Food Management System
.DESCRIPTION
    Ce script installe et configure automatiquement l'application Fast Food
    avec Docker, vérifie les prérequis et lance l'application.
#>

$ErrorActionPreference = "Stop"

# Couleurs pour l'affichage
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
║   🍔 FAST FOOD MANAGEMENT SYSTEM - SETUP                 ║
║                                                           ║
║   Installation et configuration automatique              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ "Yellow"

Write-Host ""

# Étape 1: Vérification des prérequis
Write-Title "Vérification des prérequis"

$prerequisites = @{
    "Docker" = { docker --version }
    "Docker Compose" = { docker-compose --version }
    "Git" = { git --version }
}

$allPrerequisitesMet = $true

foreach ($prereq in $prerequisites.Keys) {
    try {
        $version = & $prerequisites[$prereq] 2>&1
        Write-Success "$prereq installé: $version"
    }
    catch {
        Write-Error "$prereq n'est pas installé"
        $allPrerequisitesMet = $false
    }
}

if (-not $allPrerequisitesMet) {
    Write-Host ""
    Write-Warning "Certains prérequis sont manquants. Veuillez les installer:"
    Write-Info "  • Docker Desktop: https://www.docker.com/products/docker-desktop"
    Write-Info "  • Git: https://git-scm.com/downloads"
    Write-Host ""
    exit 1
}

# Étape 2: Configuration
Write-Title "Configuration du projet"

# Vérifier si .env existe déjà
$envExists = Test-Path ".env"
if ($envExists) {
    Write-Warning "Le fichier .env existe déjà"
    $overwrite = Read-Host "Voulez-vous le recréer? (o/N)"
    if ($overwrite -ne "o" -and $overwrite -ne "O") {
        Write-Info "Configuration existante conservée"
    }
    else {
        Remove-Item ".env" -Force
        $envExists = $false
    }
}

if (-not $envExists) {
    Write-Info "Création du fichier .env..."

    # Générer un JWT secret aléatoire
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

    # Demander le mot de passe PostgreSQL
    Write-Host ""
    $dbPassword = Read-Host "Mot de passe PostgreSQL (laisser vide pour 'fastfood123')"
    if ([string]::IsNullOrWhiteSpace($dbPassword)) {
        $dbPassword = "fastfood123"
    }

    # Créer le fichier .env
    @"
# Base de données PostgreSQL
POSTGRES_USER=fastfood_user
POSTGRES_PASSWORD=$dbPassword
POSTGRES_DB=fastfood_db
DATABASE_URL=postgresql://fastfood_user:$dbPassword@postgres:5432/fastfood_db

# Backend API
PORT=3000
JWT_SECRET=$jwtSecret
NODE_ENV=production

# Frontend
VITE_API_URL=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8

    Write-Success "Fichier .env créé avec succès"
}

# Demander si on veut importer les catégories par défaut
Write-Host ""
$importCategories = Read-Host "Voulez-vous importer les 43 catégories fast-food par défaut? (O/n)"
$shouldImportCategories = ($importCategories -ne "n" -and $importCategories -ne "N")

# Modifier le Dockerfile si nécessaire
$dockerfilePath = "backend/Dockerfile"
$dockerfileContent = Get-Content $dockerfilePath -Raw

if ($shouldImportCategories) {
    # S'assurer que la ligne n'est pas commentée
    if ($dockerfileContent -match "#\s*echo 'npx tsx src/scripts/seed-categories-fastfood\.ts") {
        Write-Info "Activation de l'import des catégories..."
        $dockerfileContent = $dockerfileContent -replace "#\s*(echo 'npx tsx src/scripts/seed-categories-fastfood\.ts)", '$1'
        Set-Content -Path $dockerfilePath -Value $dockerfileContent -NoNewline
        Write-Success "Import des catégories activé"
    }
    else {
        Write-Info "Import des catégories déjà activé"
    }
}
else {
    # Commenter la ligne si elle ne l'est pas déjà
    if ($dockerfileContent -match "^\s*echo 'npx tsx src/scripts/seed-categories-fastfood\.ts" -and $dockerfileContent -notmatch "#\s*echo 'npx tsx src/scripts/seed-categories-fastfood\.ts") {
        Write-Info "Désactivation de l'import des catégories..."
        $dockerfileContent = $dockerfileContent -replace "(echo 'npx tsx src/scripts/seed-categories-fastfood\.ts)", '# $1'
        Set-Content -Path $dockerfilePath -Value $dockerfileContent -NoNewline
        Write-Success "Import des catégories désactivé"
    }
    else {
        Write-Info "Import des catégories déjà désactivé"
    }
}

# Étape 3: Nettoyage des anciens containers
Write-Title "Nettoyage des anciens containers"

try {
    docker-compose down -v 2>&1 | Out-Null
    Write-Success "Anciens containers supprimés"
}
catch {
    Write-Info "Aucun container à supprimer"
}

# Étape 4: Build des images Docker
Write-Title "Build des images Docker"

Write-Info "Construction des images... (cela peut prendre quelques minutes)"
Write-Host ""

$buildOutput = docker-compose build --no-cache 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Images Docker construites avec succès"
}
else {
    Write-Error "Erreur lors du build des images"
    Write-Host $buildOutput
    exit 1
}

# Étape 5: Démarrage de l'application
Write-Title "Démarrage de l'application"

Write-Info "Lancement des containers..."
$startOutput = docker-compose up -d 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Success "Containers démarrés avec succès"
}
else {
    Write-Error "Erreur lors du démarrage"
    Write-Host $startOutput
    exit 1
}

# Attendre que les services soient prêts
Write-Host ""
Write-Info "Vérification de l'état des services..."
Start-Sleep -Seconds 5

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
        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

Write-Host ""

if ($backendReady) {
    Write-Success "Backend est opérationnel"
}
else {
    Write-Warning "Le backend met du temps à démarrer. Vérifiez les logs avec: docker-compose logs -f"
}

# Étape 6: Résumé et accès
Write-Title "Installation terminée !"

Write-Host ""
Write-Color "🎉 L'application Fast Food Management est prête !" "Green"
Write-Host ""
Write-Info "Accès à l'application:"
Write-Color "  • Frontend: " "White" -NoNewline
Write-Color "http://localhost:5173" "Cyan"
Write-Color "  • Backend API: " "White" -NoNewline
Write-Color "http://localhost:3000" "Cyan"
Write-Host ""

Write-Info "Compte administrateur par défaut:"
Write-Color "  • Email: " "White" -NoNewline
Write-Color "admin@fastfood.com" "Yellow"
Write-Color "  • Mot de passe: " "White" -NoNewline
Write-Color "admin123" "Yellow"
Write-Host ""

Write-Info "Commandes utiles:"
Write-Color "  • Voir les logs: " "White" -NoNewline
Write-Color "docker-compose logs -f" "Cyan"
Write-Color "  • Arrêter: " "White" -NoNewline
Write-Color "docker-compose down" "Cyan"
Write-Color "  • Redémarrer: " "White" -NoNewline
Write-Color "docker-compose restart" "Cyan"
Write-Color "  • Backup DB: " "White" -NoNewline
Write-Color ".\backup-database.ps1" "Cyan"
Write-Color "  • Restore DB: " "White" -NoNewline
Write-Color ".\restore-database.ps1" "Cyan"
Write-Host ""

Write-Warning "N'oubliez pas de changer le mot de passe administrateur après la première connexion !"
Write-Host ""

# Demander si on veut ouvrir le navigateur
$openBrowser = Read-Host "Voulez-vous ouvrir l'application dans le navigateur? (O/n)"
if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
    Start-Process "http://localhost:5173"
}

Write-Success "Setup terminé avec succès !"
