# Fetch LiveKit C++ Windows x64 prebuilt SDK into windows/third_party/livekit-sdk/
# Used by JungleSystem native LiveKit room (group call audio).

$ErrorActionPreference = "Stop"

$Version = if ($env:KOLAM_LIVEKIT_SDK_VERSION) { $env:KOLAM_LIVEKIT_SDK_VERSION } else { "1.4.0" }
$RepoRoot = Split-Path -Parent $PSScriptRoot
$DestRoot = Join-Path $RepoRoot "windows\third_party\livekit-sdk"
$Extracted = Join-Path $DestRoot "livekit-sdk-windows-x64-$Version"
$MarkerLib = Join-Path $Extracted "lib\livekit.lib"

if (Test-Path $MarkerLib) {
  Write-Host "LiveKit SDK $Version already present."
  exit 0
}

New-Item -ItemType Directory -Force -Path $DestRoot | Out-Null
$ZipPath = Join-Path $DestRoot "livekit-sdk-windows-x64-$Version.zip"
$Uri = "https://github.com/livekit/client-sdk-cpp/releases/download/v$Version/livekit-sdk-windows-x64-$Version.zip"

Write-Host "Downloading $Uri ..."
Invoke-WebRequest -Uri $Uri -OutFile $ZipPath -UseBasicParsing

if (Test-Path $Extracted) {
  Remove-Item -Recurse -Force $Extracted
}

Expand-Archive -Path $ZipPath -DestinationPath $DestRoot -Force
Remove-Item $ZipPath -Force

if (-not (Test-Path $MarkerLib)) {
  throw "LiveKit SDK extract failed - missing $MarkerLib"
}

Write-Host "LiveKit SDK $Version ready at $Extracted"
