@echo off
chcp 65001 > nul
cls

echo ================================================================
echo    ARRÊT FASTFOOD
echo ================================================================
echo.
echo Arrêt de l'application en cours...

docker-compose stop

if %errorlevel% equ 0 (
    echo.
    echo ✓ Application arrêtée avec succès !
    echo.
    echo Pour redémarrer, utilisez : start.bat
    echo.
) else (
    echo.
    echo ERREUR lors de l'arrêt !
    echo.
)

timeout /t 3
