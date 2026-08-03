@echo off
chcp 65001 >nul
title FastFood - Sauvegarde de la base de donnees

REM === Parametres de connexion (doivent correspondre a backend\.env -> DATABASE_URL) ===
set DB_USER=postgres
set DB_NAME=fastfood_db
set DB_HOST=localhost
set DB_PORT=5432
set PGPASSWORD=721RRTeJi5kiylmLxWAXc3ql1YzZWNnR

REM === Si pg_dump n'est pas dans le PATH, decommentez et ajustez la ligne suivante ===
REM set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin

REM === Dossier de sauvegarde + horodatage (format yyyy-MM-dd_HHmmss, insensible a la langue) ===
if not exist "%~dp0backups" mkdir "%~dp0backups"
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HHmmss"') do set STAMP=%%i
set OUTFILE=%~dp0backups\fastfood_%STAMP%.sql

echo Sauvegarde de la base "%DB_NAME%" vers :
echo   %OUTFILE%
echo.
pg_dump -U %DB_USER% -h %DB_HOST% -p %DB_PORT% %DB_NAME% > "%OUTFILE%"

if %ERRORLEVEL%==0 (
  echo.
  echo [OK] Sauvegarde reussie.
) else (
  echo.
  echo [ERREUR] La sauvegarde a echoue. Verifiez que PostgreSQL est demarre
  echo          et que pg_dump est accessible ^(voir la ligne PATH ci-dessus^).
  del "%OUTFILE%" 2>nul
)
echo.
pause
