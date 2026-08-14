[CmdletBinding()]
param(
  [ValidatePattern('^\d+\.\d+\.\d+$')]
  [string]$Version = "3.1.4",

  [string]$MsixPath,

  [string]$CerPath = $env:JUNGLESYSTEM_DEV_CER_PATH
)

$ErrorActionPreference = "Stop"

function Resolve-RepoRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Get-ISCCPath {
  $candidates = @(
    (Join-Path $env:LOCALAPPDATA "Programs\Inno Setup 6\ISCC.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Inno Setup 6\ISCC.exe"),
    (Join-Path $env:ProgramFiles "Inno Setup 6\ISCC.exe")
  )
  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
      return $candidate
    }
  }
  $cmd = Get-Command ISCC.exe -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }
  throw "ISCC.exe not found. Install Inno Setup 6."
}

$repoRoot = Resolve-RepoRoot
$issPath = Join-Path $repoRoot "installer\JungleSystem.iss"
$payloadDir = Join-Path $repoRoot "installer\payload"
$outputDir = Join-Path $repoRoot "dist\junglesystem\$Version"
$scriptSource = Join-Path $repoRoot "installer\install-junglesystem.ps1"

if (-not $MsixPath) {
  $MsixPath = Join-Path $outputDir "JungleSystem_${Version}_x64.msix"
}
if (-not $CerPath) {
  $CerPath = "E:\Data\Dunia-Anura\certs\JungleSystem-dev.cer"
}

if (-not (Test-Path -LiteralPath $issPath)) {
  throw "Missing $issPath"
}
if (-not (Test-Path -LiteralPath $scriptSource)) {
  throw "Missing $scriptSource"
}
if (-not (Test-Path -LiteralPath $MsixPath)) {
  throw "MSIX not found: $MsixPath. Build it with npm run build:msix first."
}
if (-not (Test-Path -LiteralPath $CerPath)) {
  throw "Certificate not found: $CerPath. Set JUNGLESYSTEM_DEV_CER_PATH."
}

$desktopClientSecret = [string]$env:KOLAM_DESKTOP_CLIENT_SECRET
if (-not $desktopClientSecret.Trim()) {
  throw "KOLAM_DESKTOP_CLIENT_SECRET wajib di environment proses build (sama dengan BE Patch D) sebelum npm run build:setup."
}

New-Item -ItemType Directory -Force -Path $payloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Copy-Item -LiteralPath $MsixPath -Destination (Join-Path $payloadDir "JungleSystem_${Version}_x64.msix") -Force
Copy-Item -LiteralPath $CerPath -Destination (Join-Path $payloadDir "JungleSystem-dev.cer") -Force
Copy-Item -LiteralPath $scriptSource -Destination (Join-Path $payloadDir "install-junglesystem.ps1") -Force

$secretPath = Join-Path $payloadDir "kolam-desktop-client.secret"
Set-Content -LiteralPath $secretPath -Value $desktopClientSecret.Trim() -NoNewline -Encoding ascii

$iscc = Get-ISCCPath
$payloadArg = $payloadDir
$outputArg = $outputDir
& $iscc `
  "/DAppVersion=$Version" `
  "/DPayloadDir=$payloadArg" `
  "/DOutputDir=$outputArg" `
  $issPath

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$setupPath = Join-Path $outputDir "JungleSystem_${Version}_x64_Setup.exe"
if (-not (Test-Path -LiteralPath $setupPath)) {
  throw "Setup.exe was not produced: $setupPath"
}

Write-Host "Setup: $setupPath"
Write-Host "Size: $((Get-Item -LiteralPath $setupPath).Length)"
