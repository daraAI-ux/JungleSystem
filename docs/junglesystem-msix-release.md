# JungleSystem MSIX Release

Dokumen ini adalah kontrak rilis installer JungleSystem Windows. Scope ini hanya
build, signing, artifact, dan manifest rilis. Auto-update di dalam aplikasi RNW
tidak termasuk.

## Identity

Identity MSIX wajib stabil antar rilis:

- Name: `JungleSystem`
- Publisher: `CN=user`
- PublisherDisplayName: `CV. Dunia Anura Indonesia`
- DisplayName: `JungleSystem`
- Public version: tiga angka, contoh `3.1.4`, `3.1.5`
- MSIX Identity Version: empat angka, contoh `3.1.4.0`, `3.1.5.0`

Nama artifact, folder output, release manifest, dan release notes memakai public
version tiga angka. Manifest MSIX tetap memakai empat angka karena itu format
wajib Windows.

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
dist\junglesystem\<public-version>\
```

Folder `dist/` tidak perlu di-commit.

## Build

Build Release x64 dengan versi manifest yang sudah ada:

```powershell
npm run build:msix
```

Bump versi sekaligus build:

```powershell
npm run build:msix -- -Version 3.1.5
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
npm run build:msix -- -Version 3.1.4
```

Atau pakai thumbprint certificate yang sudah ada di store:

```powershell
$env:JUNGLESYSTEM_PACKAGE_CERTIFICATE_THUMBPRINT="<thumbprint>"
npm run build:msix -- -Version 3.1.4
```

Jangan commit `.pfx`, password, `.env`, atau secret lain. File sertifikat
dev disimpan di luar repo, contoh `E:\Data\Dunia-Anura\certs\`.

Buat sertifikat self-signed `CN=user` sekali, lalu pakai terus sampai ada
sertifikat produksi:

```powershell
$certDir = "E:\Data\Dunia-Anura\certs"
New-Item -ItemType Directory -Force -Path $certDir | Out-Null
$cert = New-SelfSignedCertificate `
  -Type Custom `
  -Subject "CN=user" `
  -KeyUsage DigitalSignature `
  -FriendlyName "JungleSystem Dev" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -TextExtension @(
    "2.5.29.37={text}1.3.6.1.5.5.7.3.3",
    "2.5.29.19={text}"
  )
Export-PfxCertificate -Cert $cert -FilePath "$certDir\JungleSystem-dev.pfx" -Password $securePassword
Export-Certificate -Cert $cert -FilePath "$certDir\JungleSystem-dev.cer"
Import-Certificate -FilePath "$certDir\JungleSystem-dev.cer" -CertStoreLocation "Cert:\CurrentUser\TrustedPeople"
```

PC klien perlu Developer Mode/sideload enabled dan certificate signer dipercaya
di `Trusted People` (`Cert:\CurrentUser\TrustedPeople` atau Local Machine).
Untuk produksi, pakai certificate code-signing tetap dan sama untuk semua rilis.

## App Installer Opsional

Jika URL HTTPS final sudah ada, set env berikut sebelum build:

```powershell
$env:JUNGLESYSTEM_MSIX_URL="https://example.com/app-downloads/JungleSystem_3.1.4_x64.msix"
$env:JUNGLESYSTEM_APPINSTALLER_URL="https://example.com/app-downloads/JungleSystem.appinstaller"
$env:JUNGLESYSTEM_RELEASE_NOTES="Rilis JungleSystem 3.1.4"
npm run build:msix -- -Version 3.1.4
```

Script akan membuat `JungleSystem.appinstaller` dengan `MainPackage` x64.

## Release Manifest

`JungleSystem.release.json` ditulis untuk agen auto-update/download:

```json
{
  "appId": "JungleSystem",
  "version": "3.1.4",
  "minOs": "10.0.17763.0",
  "url": "https://example.com/app-downloads/JungleSystem_3.1.4_x64.msix",
  "sha512": "...",
  "sha256": "...",
  "size": 123456789,
  "appinstallerUrl": "https://example.com/app-downloads/JungleSystem.appinstaller",
  "artifact": "JungleSystem_3.1.4_x64.msix",
  "appinstaller": "JungleSystem.appinstaller",
  "releaseNotes": "Rilis JungleSystem 3.1.4"
}
```

URL wajib HTTPS untuk distribusi/update. File harus signed dan identity harus
sama dengan rilis sebelumnya.

## Install Manual

Install MSIX:

```powershell
Add-AppxPackage .\JungleSystem_3.1.4_x64.msix
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

`JungleSystem_<version>_x64_Setup.exe` adalah wrapper Inno di atas MSIX yang
sama. Wizard berbahasa Indonesia, progress, dan status langkah (menyalin paket,
memasang sertifikat, memasang JungleSystem, pintasan Desktop, selesai). Tidak
ada halaman lisensi/persetujuan. Gambar samping memakai logo JungleSystem
(`installer/images/`, 164x314 dan 55x55).

Butuh Admin (UAC Windows). Silent:

```powershell
.\JungleSystem_3.1.4_x64_Setup.exe /VERYSILENT /NORESTART
```

Bangun Setup setelah MSIX signed ada:

```powershell
npm run build:setup
```

Cert `.cer` diambil dari luar repo (`JUNGLESYSTEM_DEV_CER_PATH` atau
`E:\Data\Dunia-Anura\certs\JungleSystem-dev.cer`). Jangan commit `.pfx` atau
password. Setup menyematkan `.cer` publik saja.

Jangan memakai Squirrel, `.nupkg`, electron-updater, atau endpoint Electron
lama `/desktop/kolam-da`.
