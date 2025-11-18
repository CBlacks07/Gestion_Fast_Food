@echo off
chcp 65001 > nul
cls

echo ================================================================
echo    DÉMARRAGE FASTFOOD
echo ================================================================
echo.

REM Vérifier si Docker est démarré
docker ps > nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR : Docker Desktop n'est pas démarré !
    echo.
    echo Veuillez ouvrir Docker Desktop et réessayer.
    echo.
    pause
    exit /b 1
)

echo Démarrage de l'application...
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ✓ Application démarrée avec succès !
    echo.
    echo Accédez à l'application : http://localhost
    echo.
    timeout /t 3 > nul
    start http://localhost
) else (
    echo.
    echo ERREUR lors du démarrage !
    echo.
    pause
)
