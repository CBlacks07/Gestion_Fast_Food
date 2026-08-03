@echo off
title FastFood - Serveur (API)
cd /d "%~dp0backend"
set NODE_ENV=production
echo ============================================
echo   FastFood - Demarrage du serveur (API)
echo   http://localhost:3010
echo ============================================
echo.
node dist\index.js
echo.
echo Le serveur s'est arrete. Verifiez le message ci-dessus.
pause
