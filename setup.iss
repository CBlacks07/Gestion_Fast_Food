; Script Inno Setup pour Gestion Fast-Food
; Pour compiler ce script, installez Inno Setup depuis https://jrsoftware.org/isinfo.php

#define MyAppName "Gestion Fast-Food"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Votre Entreprise"
#define MyAppURL "http://www.example.com/"
#define MyAppExeName "Demarrer.bat"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
AppId={{XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=LICENSE.txt
; Décommenter la ligne suivante pour utiliser une icône personnalisée
; SetupIconFile=icon.ico
OutputDir=installer
OutputBaseFilename=GestionFastFood-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}";

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: ".git,node_modules,dist,build,installer,*.log"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Arrêter {#MyAppName}"; Filename: "{app}\Arreter.bat"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon
; Décommenter si vous avez une icône
; Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\icon.ico"

[Run]
; Vérifier Docker Desktop
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\check-docker.ps1"""; Flags: runhidden waituntilterminated
; Proposer de démarrer l'application
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
begin
  // Vérifier si Docker Desktop est installé
  if not FileExists('C:\Program Files\Docker\Docker\Docker Desktop.exe') then
  begin
    if MsgBox('Docker Desktop n''est pas installé. Cette application nécessite Docker Desktop pour fonctionner.' + #13#10 + #13#10 + 'Voulez-vous ouvrir la page de téléchargement de Docker Desktop ?', mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://www.docker.com/products/docker-desktop', '', '', SW_SHOW, ewNoWait, ResultCode);
    end;
    Result := False;
  end
  else
    Result := True;
end;
