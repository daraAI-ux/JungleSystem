# Setup Windows

Dokumen ini mencatat bootstrap lokal untuk Kolam Windows.

Untuk konteks produk gabungan, source live, auth source, sync scope, dan status
plugin, baca `docs\architecture.md`.

## 1. Install dependency JavaScript

```powershell
cd E:\Data\Dunia-Anura\KolamWindows
npm install
```

Jika PowerShell memblokir `npm.ps1`, gunakan:

```powershell
npm.cmd install
```

## 2. Cek toolchain native

```powershell
npm run doctor:windows
```

Status minimum sebelum `npm run windows` bisa sukses:

- Node.js 22+
- npm
- PowerShell 7 / `pwsh.exe`
- .NET SDK
- Visual Studio dengan `vswhere.exe`
- Solution `windows\KolamWindows.sln`
- Project `windows\KolamWindows\KolamWindows.vcxproj`

## 3. Install dependency React Native Windows

React Native Windows menyediakan helper:

```powershell
node_modules\react-native-windows\scripts\rnw-dependencies.ps1
```

Jalankan dari PowerShell elevated jika installer perlu mengubah komponen sistem.

## 4. Jalankan app

Terminal 1:

```powershell
npm start
```

Terminal 2:

```powershell
npm run windows
```

Jika first run gagal di tahap deploy dengan `DEP0730` atau pesan Developer Mode
belum aktif, buka Windows Settings -> Privacy & security -> For developers lalu
aktifkan Developer Mode. React Native Windows CLI kadang baru membuat policy
efektif setelah percobaan pertama; setelah Developer Mode aktif, jalankan ulang:

```powershell
$env:Path=[System.Environment]::GetEnvironmentVariable('Path','Machine')+';'+[System.Environment]::GetEnvironmentVariable('Path','User')
npm.cmd run windows
```

Run yang sukses akan melewati urutan restore, build, deploy, loopback exemption,
dan `Starting the app`.

## 5. Gate harian

```powershell
npm run lint
npm run typecheck
npm test -- --runInBand
npm run test:windows -- --runInBand
npm run verify:file-size
npm run verify:live-routes
npm run verify:shell-routes
npm run verify:runtime-backend
npm run verify:sources
npm run verify:registry
```

`verify:live-routes` memeriksa semua `page.tsx` FE live di
`E:\Projects\_latest-da\da-inventory-frontend\src\app\(app)` sudah terdaftar di
registry route native KolamWindows.
`verify:shell-routes` memeriksa page POS dan AM dari source lokal sudah
terdaftar sebagai route shell native sehingga aplikasi bisa dibuka luas dulu.
`verify:runtime-backend` memastikan URL runtime tetap server existing dan
identitas client native Windows tetap lengkap untuk server gate.
`verify:sources` memeriksa 19 repo utama di `E:\Projects`, termasuk manifest dan
versi 9 plugin DA yang dipakai oleh shell unified.
`verify:registry` memastikan registry native plugin di `src\domain\unified.ts`
tetap sama dengan `package.json` dan `src\manifest.ts` plugin live.
