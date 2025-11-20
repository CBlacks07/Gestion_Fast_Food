@echo off
chcp 65001 > nul
cls

echo ================================================================
echo    LOGS FASTFOOD
echo ================================================================
echo.
echo Affichage des logs en temps réel...
echo Appuyez sur Ctrl+C pour quitter
echo.
pause

docker-compose logs -f
