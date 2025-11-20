@echo off
chcp 65001 > nul
cls

echo ================================================================
echo    INSTALLATION FASTFOOD - GESTION DE RESTAURANT
echo ================================================================
echo.
echo Ce script va installer automatiquement l'application FastFood
echo sur votre ordinateur Windows.
echo.
echo Prérequis : Docker Desktop doit être installé
echo.
pause

REM Vérifier si Docker est installé
echo.
echo [1/5] Vérification de Docker...
docker --version > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERREUR : Docker Desktop n'est pas installé !
    echo.
    echo Veuillez installer Docker Desktop depuis :
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)
echo ✓ Docker Desktop installé

REM Vérifier si Docker est démarré
echo.
echo [2/5] Vérification que Docker est démarré...
docker ps > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERREUR : Docker Desktop n'est pas démarré !
    echo.
    echo Veuillez :
    echo 1. Ouvrir Docker Desktop
    echo 2. Attendre qu'il soit complètement démarré
    echo 3. Relancer ce script
    echo.
    pause
    exit /b 1
)
echo ✓ Docker est démarré

REM Créer le fichier .env si nécessaire
echo.
echo [3/5] Configuration de l'environnement...
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env" > nul
    echo ✓ Fichier .env créé
) else (
    echo ✓ Fichier .env existe déjà
)

REM Arrêter les conteneurs existants
echo.
echo [4/5] Nettoyage des installations précédentes...
docker-compose down > nul 2>&1
echo ✓ Nettoyage terminé

REM Builder et démarrer les conteneurs
echo.
echo [5/5] Installation de l'application (cela peut prendre 5-10 minutes)...
echo.
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo ERREUR lors de l'installation !
    echo Consultez les messages ci-dessus pour plus de détails.
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================================
echo    INSTALLATION TERMINÉE AVEC SUCCÈS !
echo ================================================================
echo.
echo L'application FastFood est maintenant installée et démarrée.
echo.
echo Pour y accéder :
echo   1. Ouvrez votre navigateur (Chrome, Firefox, Edge...)
echo   2. Allez sur : http://localhost
echo.
echo Identifiants par défaut :
echo   Username : admin
echo   Password : Admin123
echo.
echo ⚠ IMPORTANT : Changez ce mot de passe après la première connexion !
echo.
echo Commandes utiles :
echo   - start.bat    : Démarrer l'application
echo   - stop.bat     : Arrêter l'application
echo   - backup.bat   : Créer une sauvegarde
echo   - logs.bat     : Voir les logs
echo.
pause
