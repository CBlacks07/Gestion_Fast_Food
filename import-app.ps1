#Requires -Version 5.1

<#
.SYNOPSIS
    Importe l'application Fast Food depuis un export offline
.DESCRIPTION
    Charge les images Docker et configure l'application pour
    une utilisation sans connexion internet.
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
║   📥 IMPORT APPLICATION - INSTALLATION OFFLINE           ║
║                                                           ║
║   Installation depuis un package pré-construit           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"@ "Yellow"

Write-Host ""

# Vérifier Docker
Write-Title "Vérification de Docker"

try {
    $dockerVersion = docker --version 2>&1
    Write-Success "Docker installé: $dockerVersion"
}
catch {
    Write-Error "Docker n'est pas installé ou n'est pas en cours d'exécution"
    Write-Host ""
    Write-Info "Installez Docker Desktop depuis:"
    Write-Color "  https://www.docker.com/products/docker-desktop" "Cyan"
    exit 1
}

# Chercher le fichier .tar
Write-Host ""
Write-Title "Recherche du package"

$tarFiles = Get-ChildItem -Filter "fastfood-app-*.tar" -ErrorAction SilentlyContinue

if (-not $tarFiles) {
    Write-Error "Aucun fichier fastfood-app-*.tar trouvé dans ce dossier"
    Write-Info "Assurez-vous que le package a été extrait correctement"
    exit 1
}

if ($tarFiles.Count -gt 1) {
    Write-Info "Plusieurs packages trouvés:"
    for ($i = 0; $i -lt $tarFiles.Count; $i++) {
        Write-Host "  [$($i + 1)] $($tarFiles[$i].Name)"
    }
    $selection = Read-Host "`nSélectionnez le numéro du package à importer"
    $tarFile = $tarFiles[$selection - 1]
}
else {
    $tarFile = $tarFiles[0]
}

Write-Success "Package trouvé: $($tarFile.Name)"
$tarSize = [math]::Round($tarFile.Length / 1MB, 2)
Write-Info "Taille: $tarSize MB"

# Import des images Docker
Write-Host ""
Write-Title "Import des images Docker"

Write-Info "Chargement des images..."
Write-Warning "Cela peut prendre plusieurs minutes selon la taille du package"
Write-Host ""

try {
    docker load -i $tarFile.FullName 2>&1 | Out-Null
    Write-Success "Images Docker importées avec succès"
}
catch {
    Write-Error "Erreur lors de l'import des images"
    exit 1
}

# Lister les images importées
Write-Host ""
Write-Info "Images importées:"
docker images --filter "reference=gestion_fast_food*" --format "  • {{.Repository}}:{{.Tag}} ({{.Size}})"
Write-Host ""

# Configuration .env
Write-Host ""
Write-Title "Configuration de l'environnement"

if (Test-Path ".env") {
    Write-Warning "Le fichier .env existe déjà"
    $overwrite = Read-Host "Voulez-vous le reconfigurer? (o/N)"
    if ($overwrite -ne "o" -and $overwrite -ne "O") {
        Write-Info "Configuration existante conservée"
        $skipEnv = $true
    }
}

if (-not $skipEnv) {
    Write-Info "Création du fichier .env..."
    Write-Host ""

    # Générer JWT secret
    $jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

    # Demander le mot de passe
    $dbPassword = Read-Host "Mot de passe PostgreSQL (laisser vide pour 'fastfood123')"
    if ([string]::IsNullOrWhiteSpace($dbPassword)) {
        $dbPassword = "fastfood123"
    }

    # Créer .env
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

    Write-Success "Fichier .env créé"
}

# Créer le dossier backups
if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" | Out-Null
    Write-Success "Dossier backups créé"
}

# Démarrage optionnel
Write-Host ""
Write-Title "Installation terminée !"

Write-Host ""
Write-Success "Application prête à être démarrée"
Write-Host ""

Write-Info "Pour démarrer l'application:"
Write-Color "  docker compose up -d" "Cyan"
Write-Host ""

Write-Info "Accès à l'application:"
Write-Color "  • Frontend: " "White" -NoNewline
Write-Color "http://localhost:5173" "Cyan"
Write-Color "  • Backend API: " "White" -NoNewline
Write-Color "http://localhost:3000" "Cyan"
Write-Host ""

Write-Info "Identifiants par défaut:"
Write-Color "  • Email: " "White" -NoNewline
Write-Color "admin@fastfood.com" "Yellow"
Write-Color "  • Mot de passe: " "White" -NoNewline
Write-Color "admin123" "Yellow"
Write-Host ""

Write-Warning "N'oubliez pas de changer le mot de passe admin après la première connexion !"
Write-Host ""

# Demander si on veut démarrer maintenant
$startNow = Read-Host "Voulez-vous démarrer l'application maintenant? (O/n)"
if ($startNow -ne "n" -and $startNow -ne "N") {
    Write-Info "Démarrage des containers..."
    docker compose up -d 2>&1 | Out-Null

    Write-Success "Containers démarrés"
    Write-Host ""
    Write-Info "Vérification (30s)..."

    $maxAttempts = 15
    $attempt = 0
    $ready = $false

    while ($attempt -lt $maxAttempts -and -not $ready) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 2 -UseBasicParsing 2>$null
            if ($response.StatusCode -eq 200) {
                $ready = $true
            }
        }
        catch {
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 2
            $attempt++
        }
    }

    Write-Host ""

    if ($ready) {
        Write-Success "Application opérationnelle !"
        Write-Info "Ouvrez votre navigateur: http://localhost:5173"

        $openBrowser = Read-Host "`nOuvrir le navigateur automatiquement? (O/n)"
        if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
            Start-Process "http://localhost:5173"
        }
    }
    else {
        Write-Warning "L'application démarre... Patientez quelques instants"
        Write-Info "Vérifiez les logs: docker compose logs -f"
    }
}

Write-Host ""
Write-Success "Import terminé avec succès !"
