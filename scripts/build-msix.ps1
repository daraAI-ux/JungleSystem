[CmdletBinding()]
param(
  [ValidatePattern('^\d+\.\d+\.\d+(\.\d+)?$')]
  [string]$Version,

  [ValidateSet('Release')]
  [string]$Configuration = "Release",

  [ValidateSet('x64')]
  [string]$Platform = "x64",

  [string]$OutputRoot = "dist\junglesystem",

  [switch]$SkipBuild,

  [switch]$NoSign,

  [string]$CertificatePath = $env:JUNGLESYSTEM_PACKAGE_CERTIFICATE_PATH,

  [string]$CertificatePassword = $env:JUNGLESYSTEM_PACKAGE_CERTIFICATE_PASSWORD,

  [string]$CertificateThumbprint = $env:JUNGLESYSTEM_PACKAGE_CERTIFICATE_THUMBPRINT,

  [string]$PackageUrl = $env:JUNGLESYSTEM_MSIX_URL,

  [string]$AppInstallerUrl = $env:JUNGLESYSTEM_APPINSTALLER_URL,

  [string]$ReleaseNotes = $env:JUNGLESYSTEM_RELEASE_NOTES
)

$ErrorActionPreference = "Stop"

function Resolve-RepoRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Read-PackageManifest([string]$Path) {
  [xml]$xml = Get-Content -Raw -LiteralPath $Path
  $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
  $ns.AddNamespace("pkg", "http://schemas.microsoft.com/appx/manifest/foundation/windows10")
  $identity = $xml.SelectSingleNode("/pkg:Package/pkg:Identity", $ns)
  if (-not $identity) {
    throw "Package identity not found in $Path."
  }
  return [pscustomobject]@{
    Xml = $xml
    Identity = $identity
    Name = $identity.Name
    Publisher = $identity.Publisher
    Version = $identity.Version
  }
}

function Set-PackageVersion([string]$Path, [string]$NextVersion) {
  $content = Get-Content -Raw -LiteralPath $Path
  $pattern = '(<Identity\b[\s\S]*?\bVersion=")[^"]+(")'
  $next = [regex]::Replace(
    $content,
    $pattern,
    "`${1}$NextVersion`${2}",
    1
  )
  if ($next -eq $content) {
    throw "Package identity Version not found in $Path."
  }
  Set-Content -LiteralPath $Path -Value $next -Encoding UTF8
}

function ConvertTo-PackageVersion([string]$InputVersion) {
  if ($InputVersion -match '^\d+\.\d+\.\d+$') {
    return "$InputVersion.0"
  }

  return $InputVersion
}

function ConvertTo-PublicVersion([string]$PackageVersion) {
  if ($PackageVersion -match '^(\d+\.\d+\.\d+)\.0$') {
    return $Matches[1]
  }

  return $PackageVersion
}

function Get-MSBuildPath {
  $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
  if (Test-Path -LiteralPath $vswhere) {
    $install = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild -property installationPath
    if ($install) {
      $candidate = Join-Path $install "MSBuild\Current\Bin\MSBuild.exe"
      if (Test-Path -LiteralPath $candidate) {
        return $candidate
      }
    }
  }

  $cmd = Get-Command MSBuild.exe -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  throw "MSBuild.exe not found. Install Visual Studio with MSBuild."
}

function Get-FileHashText([string]$Path, [string]$Algorithm) {
  return (Get-FileHash -LiteralPath $Path -Algorithm $Algorithm).Hash.ToLowerInvariant()
}

function Write-AppInstallerFile(
  [string]$Path,
  [string]$PackageName,
  [string]$Publisher,
  [string]$PackageVersion,
  [string]$PackageUri,
  [string]$SelfUri
) {
  $content = @"
<?xml version="1.0" encoding="utf-8"?>
<AppInstaller
  xmlns="http://schemas.microsoft.com/appx/appinstaller/2017/2"
  Uri="$SelfUri"
  Version="$PackageVersion">
  <MainPackage
    Name="$PackageName"
    Publisher="$Publisher"
    Version="$PackageVersion"
    ProcessorArchitecture="x64"
    Uri="$PackageUri" />
  <UpdateSettings>
    <OnLaunch HoursBetweenUpdateChecks="0" />
  </UpdateSettings>
</AppInstaller>
"@
  Set-Content -LiteralPath $Path -Value $content -Encoding UTF8
}

$repoRoot = Resolve-RepoRoot
Set-Location $repoRoot

$manifestPath = Join-Path $repoRoot "windows\KolamWindows.Package\Package.appxmanifest"
$solutionPath = Join-Path $repoRoot "windows\KolamWindows.sln"
$appPackagesRoot = Join-Path $repoRoot "windows\KolamWindows.Package\AppPackages"

if ($Version) {
  Set-PackageVersion -Path $manifestPath -NextVersion (ConvertTo-PackageVersion -InputVersion $Version)
}

$manifest = Read-PackageManifest $manifestPath

if ($manifest.Name -ne "JungleSystem") {
  throw "Unexpected package identity Name '$($manifest.Name)'. Expected 'JungleSystem'."
}

if ($manifest.Publisher -ne "CN=user") {
  throw "Unexpected package Publisher '$($manifest.Publisher)'. Expected 'CN=user' until a production certificate is approved."
}

if ($manifest.Version -notmatch '^\d+\.\d+\.\d+\.\d+$') {
  throw "MSIX Version must use four numbers. Current value: $($manifest.Version)."
}

$packageVersion = $manifest.Version
$releaseVersion = ConvertTo-PublicVersion -PackageVersion $packageVersion
$outputDir = Join-Path $repoRoot (Join-Path $OutputRoot $releaseVersion)
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

if ($PackageUrl -and $PackageUrl -notmatch '^https://') {
  throw "JUNGLESYSTEM_MSIX_URL must be HTTPS."
}

if ($AppInstallerUrl -and $AppInstallerUrl -notmatch '^https://') {
  throw "JUNGLESYSTEM_APPINSTALLER_URL must be HTTPS."
}

if (-not $SkipBuild) {
  & npm.cmd run build:tiptap
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }

  $msbuild = Get-MSBuildPath
  $solutionDir = (Join-Path $repoRoot "windows\")
  $reactNativeWindowsDir = (Join-Path $repoRoot "node_modules\react-native-windows\")
  $msbuildArgs = @(
    $solutionPath,
    "/restore",
    "/m",
    "/p:Configuration=$Configuration",
    "/p:Platform=$Platform",
    "/p:SolutionDir=$solutionDir",
    "/p:ReactNativeWindowsDir=$reactNativeWindowsDir",
    "/p:UseFabric=true",
    "/p:GenerateAppxPackageOnBuild=true",
    "/p:UapAppxPackageBuildMode=SideloadOnly",
    "/p:AppxBundle=Never",
    "/p:AppxBundlePlatforms=$Platform"
  )

  if ($NoSign) {
    $msbuildArgs += "/p:AppxPackageSigningEnabled=false"
  } elseif ($CertificatePath) {
    $resolvedCertPath = (Resolve-Path -LiteralPath $CertificatePath).Path
    $msbuildArgs += "/p:PackageCertificateKeyFile=$resolvedCertPath"
    if ($CertificatePassword) {
      $msbuildArgs += "/p:PackageCertificatePassword=$CertificatePassword"
    }
  } elseif ($CertificateThumbprint) {
    $msbuildArgs += "/p:PackageCertificateThumbprint=$CertificateThumbprint"
  }

  & $msbuild @msbuildArgs
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

$artifact = Get-ChildItem -LiteralPath $appPackagesRoot -Recurse -File -Include "*.msix", "*.msixbundle" |
  Where-Object {
    $_.Name -match [regex]::Escape($packageVersion) -and
    $_.Name -match $Platform -and
    $_.Name -match $Configuration
  } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $artifact) {
  throw "No $Configuration $Platform MSIX artifact for version $packageVersion found under $appPackagesRoot."
}

$extension = $artifact.Extension.ToLowerInvariant()
$releaseArtifactName = "JungleSystem_${releaseVersion}_${Platform}${extension}"
$releaseArtifactPath = Join-Path $outputDir $releaseArtifactName
Copy-Item -LiteralPath $artifact.FullName -Destination $releaseArtifactPath -Force

$sha512 = Get-FileHashText -Path $releaseArtifactPath -Algorithm SHA512
$sha256 = Get-FileHashText -Path $releaseArtifactPath -Algorithm SHA256
$size = (Get-Item -LiteralPath $releaseArtifactPath).Length

$appInstallerPath = $null
if ($PackageUrl -and $AppInstallerUrl) {
  $appInstallerPath = Join-Path $outputDir "JungleSystem.appinstaller"
  Write-AppInstallerFile `
    -Path $appInstallerPath `
    -PackageName $manifest.Name `
    -Publisher $manifest.Publisher `
    -PackageVersion $packageVersion `
    -PackageUri $PackageUrl `
    -SelfUri $AppInstallerUrl
}

$releaseManifest = [ordered]@{
  appId = "JungleSystem"
  version = $releaseVersion
  minOs = "10.0.17763.0"
  url = $PackageUrl
  sha512 = $sha512
  sha256 = $sha256
  size = $size
  appinstallerUrl = $AppInstallerUrl
  artifact = $releaseArtifactName
  appinstaller = if ($appInstallerPath) { "JungleSystem.appinstaller" } else { $null }
  releaseNotes = if ($ReleaseNotes) { $ReleaseNotes } else { "JungleSystem $releaseVersion" }
}

$releaseManifestPath = Join-Path $outputDir "JungleSystem.release.json"
$releaseManifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $releaseManifestPath -Encoding UTF8

$checksumPath = Join-Path $outputDir "checksums.txt"
@(
  "SHA512  $sha512  $releaseArtifactName",
  "SHA256  $sha256  $releaseArtifactName",
  "SIZE    $size  $releaseArtifactName"
) | Set-Content -LiteralPath $checksumPath -Encoding UTF8

Write-Host "Release artifact: $releaseArtifactPath"
Write-Host "SHA512: $sha512"
Write-Host "SHA256: $sha256"
Write-Host "Size: $size"
Write-Host "Release manifest: $releaseManifestPath"
if ($appInstallerPath) {
  Write-Host "App Installer: $appInstallerPath"
}
