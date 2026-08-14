[CmdletBinding()]
param(
  [ValidateSet('cert', 'app', 'shortcut', 'secret')]
  [Parameter(Mandatory = $true)]
  [string]$Action,

  [string]$CerPath,
  [string]$MsixPath,
  [string]$SecretFile
)

$ErrorActionPreference = "Stop"

function Get-JungleSystemPackage {
  return Get-AppxPackage -Name "JungleSystem" -ErrorAction SilentlyContinue |
    Sort-Object { [version]$_.Version } -Descending |
    Select-Object -First 1
}

function Broadcast-EnvironmentChange {
  try {
    Add-Type -Namespace JungleSystemInstall -Name NativeMethods -MemberDefinition @"
using System;
using System.Runtime.InteropServices;
public static class NativeMethods {
  [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
  public static extern IntPtr SendMessageTimeout(
    IntPtr hWnd,
    uint Msg,
    UIntPtr wParam,
    string lParam,
    uint fuFlags,
    uint uTimeout,
    out UIntPtr lpdwResult);
}
"@ -ErrorAction SilentlyContinue
    $result = [UIntPtr]::Zero
    [void][JungleSystemInstall.NativeMethods]::SendMessageTimeout(
      [IntPtr]0xffff,
      0x1A,
      [UIntPtr]::Zero,
      "Environment",
      2,
      5000,
      [ref]$result
    )
  } catch {
    # Best-effort; relaunch/sign-out still picks up Machine/User env.
  }
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
  'secret' {
    if (-not $SecretFile -or -not (Test-Path -LiteralPath $SecretFile)) {
      throw "Kolam desktop client secret file not found."
    }
    $secret = (Get-Content -LiteralPath $SecretFile -Raw -ErrorAction Stop).Trim()
    if (-not $secret) {
      throw "Kolam desktop client secret file is empty."
    }
    # Same secret BE uses for Patch D HMAC. Native bridge reads process/User/Machine env.
    [Environment]::SetEnvironmentVariable(
      'KOLAM_DESKTOP_CLIENT_SECRET',
      $secret,
      'Machine'
    )
    [Environment]::SetEnvironmentVariable(
      'KOLAM_DESKTOP_CLIENT_SECRET',
      $secret,
      'User'
    )
    $env:KOLAM_DESKTOP_CLIENT_SECRET = $secret
    Broadcast-EnvironmentChange
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
