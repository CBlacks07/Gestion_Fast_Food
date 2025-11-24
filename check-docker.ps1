# Script pour vérifier et démarrer Docker Desktop
$ErrorActionPreference = "SilentlyContinue"

# Vérifier si Docker est en cours d'exécution
$dockerRunning = $false
try {
    $null = docker version 2>$null
    $dockerRunning = $LASTEXITCODE -eq 0
} catch {
    $dockerRunning = $false
}

if (-not $dockerRunning) {
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        # Attendre que Docker démarre
        Start-Sleep -Seconds 30
    }
}
