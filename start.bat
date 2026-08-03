@echo off
chcp 65001 >nul
echo ============================================
echo   FastFood - Demarrage complet de la caisse
echo ============================================
echo.
echo 1/3 - Lancement du serveur (API)...
start "FastFood Serveur" "%~dp0start-backend.bat"

echo 2/3 - Attente du serveur (6 secondes)...
timeout /t 6 /nobreak >nul

echo 3/3 - Lancement de l'interface caisse...
start "FastFood Caisse" "%~dp0start-frontend.bat"

timeout /t 5 /nobreak >nul
echo.
echo Ouverture du navigateur sur http://localhost:5173
start "" http://localhost:5173

echo.
echo ============================================
echo   La caisse est lancee.
echo   - Laissez les DEUX fenetres ouvertes.
echo   - Pour tout arreter : fermez les deux fenetres.
echo ============================================
echo.
echo Vous pouvez fermer CETTE fenetre.
timeout /t 8 /nobreak >nul
