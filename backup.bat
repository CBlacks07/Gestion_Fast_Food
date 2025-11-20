@echo off
chcp 65001 > nul
cls

echo ================================================================
echo    SAUVEGARDE FASTFOOD
echo ================================================================
echo.

REM Créer le dossier de sauvegarde s'il n'existe pas
if not exist "backups" mkdir backups

REM Générer le nom du fichier avec la date
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%b%%a)
for /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a%%b)
set datetime=%mydate%_%mytime%
set backupfile=backups\backup_%datetime%.sql

echo Création de la sauvegarde...
echo Fichier : %backupfile%
echo.

REM Sauvegarder la base de données
docker-compose exec -T postgres pg_dump -U fastfood_admin fastfood_db > %backupfile%

if %errorlevel% equ 0 (
    echo.
    echo ✓ Sauvegarde créée avec succès !
    echo.
    echo Fichier : %backupfile%
    echo.

    REM Afficher la taille du fichier
    for %%A in (%backupfile%) do set size=%%~zA
    echo Taille : %size% octets
    echo.
) else (
    echo.
    echo ERREUR lors de la sauvegarde !
    echo.
)

pause
