# JungleSystem MSIX Release

Dokumen ini adalah kontrak rilis installer JungleSystem Windows. Scope ini hanya
build, signing, artifact, dan manifest rilis. Auto-update di dalam aplikasi RNW
tidak termasuk.

## Identity

Identity MSIX wajib stabil antar rilis:

- Name: `JungleSystem`
- Publisher: `CN=user`
- DisplayName: `JungleSystem`
- Version: empat angka, contoh `1.0.0.0`, `1.0.1.0`

Jangan mengubah `Publisher` kecuali sudah ada code-signing certificate produksi
resmi dan rilis berikutnya akan memakai publisher itu terus. Publisher yang
berubah membuat Windows menganggap paket sebagai aplikasi berbeda.

## Artifact

Output utama setiap rilis:

- `JungleSystem_<version>_x64.msix`
- `JungleSystem.release.json`
- `checksums.txt`
- opsional `JungleSystem.appinstaller`

Default output lokal:

```powershell
dist\junglesystem\<version>\
```

Folder `dist/` tidak perlu di-commit.

## Build

Build Release x64 dengan versi manifest yang sudah ada:

```powershell
npm run build:msix
```

Bump versi sekaligus build:

```powershell
npm run build:msix -- -Version 1.0.1.0
```

Build tanpa signing hanya untuk diagnosa packaging:

```powershell
npm run build:msix -- -NoSign
```

MSIX unsigned tidak siap dipasang di PC klien.

## Signing

Dev signing memakai certificate lokal dengan publisher yang sama dengan manifest
sementara, yaitu `CN=user`.

Contoh env untuk file PFX di luar repo:

```powershell
$env:JUNGLESYSTEM_PACKAGE_CERTIFICATE_PATH="D:\certs\JungleSystem-dev.pfx"
$env:JUNGLESYSTEM_PACKAGE_CERTIFICATE_PASSWORD="<password proses>"
npm run build:msix -- -Version 1.0.1.0
```

Atau pakai thumbprint certificate yang sudah ada di store:

```powershell
$env:JUNGLESYSTEM_PACKAGE_CERTIFICATE_THUMBPRINT="<thumbprint>"
npm run build:msix -- -Version 1.0.1.0
```

Jangan commit `.pfx`, password, `.env`, atau secret lain.

PC klien perlu Developer Mode/sideload enabled dan certificate signer dipercaya
di `Trusted People` atau store yang sesuai. Untuk produksi, pakai certificate
code-signing tetap dan sama untuk semua rilis.

## App Installer Opsional

Jika URL HTTPS final sudah ada, set env berikut sebelum build:

```powershell
$env:JUNGLESYSTEM_MSIX_URL="https://example.com/app-downloads/JungleSystem_1.0.1.0_x64.msix"
$env:JUNGLESYSTEM_APPINSTALLER_URL="https://example.com/app-downloads/JungleSystem.appinstaller"
$env:JUNGLESYSTEM_RELEASE_NOTES="Rilis JungleSystem 1.0.1.0"
npm run build:msix -- -Version 1.0.1.0
```

Script akan membuat `JungleSystem.appinstaller` dengan `MainPackage` x64.

## Release Manifest

`JungleSystem.release.json` ditulis untuk agen auto-update/download:

```json
{
  "appId": "JungleSystem",
  "version": "1.0.1.0",
  "minOs": "10.0.17763.0",
  "url": "https://example.com/app-downloads/JungleSystem_1.0.1.0_x64.msix",
  "sha512": "...",
  "sha256": "...",
  "size": 123456789,
  "appinstallerUrl": "https://example.com/app-downloads/JungleSystem.appinstaller",
  "artifact": "JungleSystem_1.0.1.0_x64.msix",
  "appinstaller": "JungleSystem.appinstaller",
  "releaseNotes": "Rilis JungleSystem 1.0.1.0"
}
```

URL wajib HTTPS untuk distribusi/update. File harus signed dan identity harus
sama dengan rilis sebelumnya.

## Install Manual

Install MSIX:

```powershell
Add-AppxPackage .\JungleSystem_1.0.1.0_x64.msix
```

Install via App Installer jika tersedia:

```powershell
start .\JungleSystem.appinstaller
```

Jika Windows menolak certificate, install certificate signer ke `Trusted People`
di PC klien atau gunakan certificate produksi yang trusted.

## Upload Ke Katalog

Upload artifact ke katalog Kolam `/app-downloads`:

- MSIX: `JungleSystem_<version>_x64.msix`
- manifest: `JungleSystem.release.json`
- checksum: `checksums.txt`
- opsional: `JungleSystem.appinstaller`

Catat:

- perintah build yang dipakai
- SHA512
- SHA256
- ukuran file
- apakah PC klien masih perlu Developer Mode/cert trust
- release notes singkat

## Fallback EXE

Fallback `.exe` hanya dipakai jika MSIX blocked oleh policy/certificate/sideload.
EXE boleh berupa Inno/NSIS wrapper yang memanggil `Add-AppxPackage` terhadap
MSIX yang sama. Jika fallback ini dibuat, dokumentasikan silent flag seperti
`/S` dan apakah butuh elevation.

Jangan memakai Squirrel, `.nupkg`, electron-updater, atau endpoint Electron
lama `/desktop/kolam-da`.
