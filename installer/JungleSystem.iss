#ifndef AppVersion
  #define AppVersion "3.1.4"
#endif
#ifndef PayloadDir
  #define PayloadDir "payload"
#endif
#ifndef OutputDir
  #define OutputDir "..\dist\junglesystem\" + AppVersion
#endif

[Setup]
AppId={{6D8A4E21-7B3C-4F90-9E12-A1C5D8E4F6B0}
AppName=JungleSystem
AppVersion={#AppVersion}
AppPublisher=CV. Dunia Anura Indonesia
CreateAppDir=no
Uninstallable=no
PrivilegesRequired=admin
DisableWelcomePage=yes
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=yes
DisableFinishedPage=no
ShowLanguageDialog=no
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
SetupIconFile=..\windows\KolamWindows\KolamWindows.ico
WizardImageFile=images\wizard-side.png
WizardSmallImageFile=images\wizard-small.png
OutputDir={#OutputDir}
OutputBaseFilename=JungleSystem_{#AppVersion}_x64_Setup
CloseApplications=no
RestartIfNeededByRun=no

[Languages]
Name: "indonesian"; MessagesFile: "languages\Indonesian.isl"

[Messages]
InstallingLabel=Menyalin paket
FinishedHeadingLabel=Selesai
FinishedLabel=JungleSystem sudah terpasang.
ClickFinish=Tutup.

[Files]
Source: "{#PayloadDir}\JungleSystem_{#AppVersion}_x64.msix"; DestDir: "{tmp}"; Flags: ignoreversion
Source: "{#PayloadDir}\JungleSystem-dev.cer"; DestDir: "{tmp}"; Flags: ignoreversion
Source: "{#PayloadDir}\install-junglesystem.ps1"; DestDir: "{tmp}"; Flags: ignoreversion

[Code]
function RunStep(const Status, Args: String): Boolean;
var
  ResultCode: Integer;
begin
  WizardForm.StatusLabel.Caption := Status;
  WizardForm.StatusLabel.Update;
  Result := Exec(
    ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'),
    Args,
    '',
    SW_HIDE,
    ewWaitUntilTerminated,
    ResultCode);
  if (not Result) or (ResultCode <> 0) then
    RaiseException(Status + ' gagal.');
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ScriptPath, CerPath, MsixPath: String;
begin
  if CurStep <> ssPostInstall then
    Exit;

  ScriptPath := ExpandConstant('{tmp}\install-junglesystem.ps1');
  CerPath := ExpandConstant('{tmp}\JungleSystem-dev.cer');
  MsixPath := ExpandConstant('{tmp}\JungleSystem_{#AppVersion}_x64.msix');

  WizardForm.ProgressGauge.Position := (WizardForm.ProgressGauge.Max * 40) div 100;
  RunStep(
    'Memasang sertifikat',
    '-NoProfile -ExecutionPolicy Bypass -File "' + ScriptPath +
    '" -Action cert -CerPath "' + CerPath + '"');

  WizardForm.ProgressGauge.Position := (WizardForm.ProgressGauge.Max * 70) div 100;
  RunStep(
    'Memasang JungleSystem',
    '-NoProfile -ExecutionPolicy Bypass -File "' + ScriptPath +
    '" -Action app -MsixPath "' + MsixPath + '"');

  WizardForm.ProgressGauge.Position := (WizardForm.ProgressGauge.Max * 90) div 100;
  RunStep(
    'Membuat pintasan Desktop',
    '-NoProfile -ExecutionPolicy Bypass -File "' + ScriptPath +
    '" -Action shortcut');

  WizardForm.ProgressGauge.Position := WizardForm.ProgressGauge.Max;
  WizardForm.StatusLabel.Caption := 'Selesai';
  WizardForm.StatusLabel.Update;
end;
