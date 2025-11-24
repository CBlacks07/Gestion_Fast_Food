@echo off
echo ========================================
echo   CREATION DE L'INSTALLEUR
echo ========================================
echo.

REM Verifier si Inno Setup est installe
set ISCC="C:\Program Files (x86)\Inno Setup 6\ISCC.exe"

if not exist %ISCC% (
    echo Erreur : Inno Setup n'est pas installe
    echo.
    echo Telechargez et installez Inno Setup depuis :
    echo https://jrsoftware.org/isdl.php
    echo.
    pause
    exit /b 1
)

REM Verifier si l'icone existe
if not exist "icon.ico" (
    echo.
    echo Attention : Aucune icone (icon.ico) trouvee.
    echo L'installeur sera cree sans icone personnalisee.
    echo.
    echo Pour ajouter une icone :
    echo 1. Telechargez une icone au format .ico
    echo 2. Renommez-la en "icon.ico"
    echo 3. Placez-la a la racine du projet
    echo.
    pause
)

REM Creer le dossier installer s'il n'existe pas
if not exist "installer" mkdir installer

REM Compiler avec Inno Setup
echo.
echo Compilation en cours...
%ISCC% setup.iss

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   INSTALLEUR CREE AVEC SUCCES !
    echo ========================================
    echo.
    echo L'installeur est disponible dans le dossier :
    echo   installer\GestionFastFood-Setup.exe
    echo.
    echo Vous pouvez maintenant distribuer cet installeur.
    echo.
) else (
    echo.
    echo Erreur lors de la compilation.
    echo Verifiez le fichier setup.iss
    echo.
)

pause
