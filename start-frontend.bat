@echo off
title FastFood - Caisse (Interface)
cd /d "%~dp0frontend"
echo ============================================
echo   FastFood - Demarrage de la caisse
echo   http://localhost:5173
echo ============================================
echo.
call npx vite preview --host --port 5173
echo.
echo L'interface s'est arretee. Verifiez le message ci-dessus.
pause
