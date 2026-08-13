[CmdletBinding()]
param(
  [ValidateSet('cert', 'app', 'shortcut')]
  [Parameter(Mandatory = $true)]
  [string]$Action,

  [string]$CerPath,
  [string]$MsixPath
)

$ErrorActionPreference = "Stop"

function Get-JungleSystemPackage {
  return Get-AppxPackage -Name "JungleSystem" -ErrorAction SilentlyContinue |
    Sort-Object { [version]$_.Version } -Descending |
    Select-Object -First 1
}

switch ($Action) {
  'cert' {
    if (-not $CerPath -or -not (Test-Path -LiteralPath $CerPath)) {
      throw "Certificate not found."
    }
    Import-Certificate -FilePath $CerPath -CertStoreLocation "Cert:\LocalMachine\TrustedPeople" | Out-Null
  }
  'app' {
    if (-not $MsixPath -or -not (Test-Path -LiteralPath $MsixPath)) {
      throw "MSIX not found."
    }
    $existing = Get-JungleSystemPackage
    if ($existing -and $existing.SignatureKind -eq 'None') {
      Remove-AppxPackage -Package $existing.PackageFullName
    }
    Add-AppxPackage -Path $MsixPath
  }
  'shortcut' {
    $pkg = Get-JungleSystemPackage
    if (-not $pkg) {
      throw "JungleSystem tidak terpasang."
    }
    $aumid = "$($pkg.PackageFamilyName)!App"
    $desktop = [Environment]::GetFolderPath("Desktop")
    if (-not $desktop) {
      $desktop = Join-Path $env:USERPROFILE "Desktop"
    }
    $dest = Join-Path $desktop "JungleSystem.lnk"
    $wsh = New-Object -ComObject WScript.Shell
    $lnk = $wsh.CreateShortcut($dest)
    $lnk.TargetPath = Join-Path $env:WINDIR "explorer.exe"
    $lnk.Arguments = "shell:AppsFolder\$aumid"
    $lnk.Description = "JungleSystem"
    $exe = Join-Path $pkg.InstallLocation "KolamWindows\JungleSystem.exe"
    if (Test-Path -LiteralPath $exe) {
      $lnk.IconLocation = "$exe,0"
    }
    $lnk.Save()
  }
}
