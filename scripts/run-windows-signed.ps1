$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") +
  ";" +
  [System.Environment]::GetEnvironmentVariable("Path", "User")

if (-not $env:KOLAM_DESKTOP_CLIENT_SECRET) {
  throw "KOLAM_DESKTOP_CLIENT_SECRET wajib tersedia di environment proses untuk login Kolam production."
}

& npm.cmd run windows -- @args
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
