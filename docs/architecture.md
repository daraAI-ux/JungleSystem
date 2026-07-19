# Architecture

Dokumen ini mengikat arah implementasi Kolam Windows sebagai aplikasi desktop
Windows native gabungan. Targetnya bukan POS tunggal dan bukan wrapper Electron,
melainkan satu shell React Native Windows untuk Kolam, POS, AM, dan plugin DA.

## Prinsip Produk

- Shell utama berjalan native Windows melalui React Native for Windows.
- Electron dan WebView bukan runtime utama aplikasi.
- Source mutakhir di `E:\Projects` menjadi acuan kontrak fitur, API, dan plugin.
- `E:\Projects\da-pos-desktop-ready` hanya fallback historis POS.
- Fitur digabung sebagai area aplikasi, bukan aplikasi terpisah.

## Area Aplikasi

| Area | Source utama | Tanggung jawab native |
| --- | --- | --- |
| Kolam | `E:\Projects\_latest-da\da-inventory-frontend` | Operasional internal, inventory, finance, service, projects, storage. |
| POS | `E:\Projects\da-pos` dan `E:\Projects\da-inventory-backend` | Checkout, catalog sellable, cart, customer, payment, cashflow, sales. |
| AM | `E:\Projects\da-automation-management` | Dashboard automation, task/workflow, hardware/device, operations. |
| Plugin | `E:\Projects\DA-*-Plugin` | Registry manifest plugin, route metadata, host compatibility, readiness. |

Registry area native berada di `src/domain/app-shell.ts` dan
`src/domain/unified.ts`. App shell harus menambahkan fitur baru melalui registry
ini agar navigasi, sync, dan access scope tetap konsisten.

Goal operasional pengembangan berada di `docs/goal.md`. Aturan penting dari
goal itu: file baru atau hasil refactor ditargetkan maksimal 5000 baris; file
besar lama seperti `App.tsx` harus dikurangi bertahap, bukan dijadikan tempat
menumpuk UI baru.

Registry aksi runtime berada di `src/domain/runtime-actions.ts`. Setiap module
shell harus punya minimal satu aksi runtime dengan source contract, status
native/live, dan gate akses Kolam/POS/AM. Action strip di UI memakai registry
ini untuk memicu sync Kolam/AM, navigasi POS, aksi checkout/cashflow, dan filter
audit plugin.

Unified command index berada di `src/domain/command-index.ts`. Index ini
menggabungkan module shell, runtime action, dan route plugin live agar shell
native punya satu permukaan pencarian/navigasi lintas Kolam, POS, AM, dan
plugin.

Route FE live Kolam juga dipetakan ke `src/domain/kolam-navigation.ts`.
Coverage route dijaga oleh `npm run verify:live-routes`, yang membandingkan
semua `page.tsx` di `E:\Projects\_latest-da\da-inventory-frontend\src\app\(app)`
dengan route native dan variant command palette.
Coverage POS dan AM dijaga oleh `npm run verify:shell-routes`, yang
membandingkan page source POS/AM dengan `src/domain/app-shell.ts` agar shell
native tetap membuka seluruh aplikasi sebelum visual final dipoles.

## Auth Dan Source

Backend Dunia Anura memakai source login dan header `x-source`. Native shell
harus menjaga source aktif per sesi, karena izin Kolam, POS, dan AM tidak sama.
Identitas aplikasi Windows native dijaga terpisah lewat kontrak
`src/domain/runtime-client-contract.ts` dan dikirim oleh `src/lib/api-client.ts`
pada setiap request:

- `Origin: app://kolamwindows`
- `User-Agent: KolamWindows/0.0.1`
- `x-da-client: kolam-windows`
- `x-da-client-version: 0.0.1`
- `x-source: Kolam | pos | am`
- optional `x-device-mac` dan `x-device-mac-signature` dari bootstrap
  `src/services/native-device-identity.ts`

Audit read-only server/NGINX untuk client gate ada di
`docs/server-runtime-access-audit.md`.

| Mode login | Body `source` | Header `x-source` | Gate akses |
| --- | --- | --- | --- |
| Kolam | `inventory` | `Kolam` | `access_inventory` atau super admin. |
| POS | `pos` | `pos` | `access_pos` atau role key `pos`. |
| AM | `am` | `am` | `access_am`. |

Flow login native:

1. User memilih source login di panel session.
2. `POST /auth/signin` dikirim dengan body dan header sesuai source.
3. Token disimpan lewat `src/services/token-store.ts` dan disinkronkan ke
   API client.
4. Shell memanggil `GET /auth/detail-user` untuk memperkaya flag akses.
5. Access scope dihitung dari user detail dan dipakai untuk gate fitur.
6. Logout memanggil `POST /auth/logout`, lalu selalu membersihkan session lokal.

Implementasi terkait:

- `src/domain/auth.ts`
- `src/services/auth-api.ts`
- `src/services/token-store.ts`
- `src/services/native-device-identity.ts`
- `src/lib/api-client.ts`

## Data Sync

`src/services/unified-data.ts` memuat dataset gabungan. Sync tidak boleh
dianggap satu status global karena setiap area bisa punya hasil berbeda.

Status per area:

- `live`: data berhasil dimuat dari backend.
- `fallback`: request live gagal dan area memakai seed fallback UI/test.
- `seed`: area memakai seed fallback UI/test karena live API tidak diminta.
- `disabled`: area tidak dicoba karena user tidak punya akses atau base URL
  belum tersedia.

Aturan sync:

- POS live hanya dicoba untuk user dengan akses POS.
- Kolam live hanya dicoba untuk user dengan akses Kolam.
- AM live hanya dicoba untuk user dengan akses AM dan URL server AM existing
  terisi.
- Default runtime mencoba backend server existing melalui opsi
  `preferLiveApi: true`.
- Seed hanya fallback UI/test/offline, bukan backend lokal.
- Tidak ada backend lokal/paralel untuk KolamWindows. Endpoint baru harus
  ditambahkan ke backend server existing/source `da-inventory-backend`, lalu
  dideploy ke server berjalan.

## Kontrak API Yang Sudah Dipakai

POS:

- `GET /products?sellable=true`
- `GET /species?sellable=true`
- `GET /customer`
- `GET /payment-method`
- `GET /pos/cashflow/active`
- `GET /sales`
- `POST /sales`
- `POST /pos/cashflow/open`
- `POST /pos/cashflow/:id/close`
- `GET /pos/cashflow/:id/sales-preview`
- `POST /customer`
- `PUT /sales/:id/status`

Kolam:

- `GET /finance-summary`
- `GET /finance-summary/sale-cost`
- `GET /dashboard/sales-graph`

AM:

- `GET /dashboard`

Catatan penting POS: payload `POST /sales` harus memakai `channel: "pos"` dan
tidak mengirim label string `sourceRef`. Backend live menganggap `sourceRef`
non-kosong sebagai ObjectId, sedangkan POS boleh mengosongkannya agar backend
memakai default offline POS.

## Plugin Host

Plugin Hub native saat ini membaca metadata dari repo plugin resmi DA, bukan
mengarang daftar manual. Registry menyimpan:

- package name
- package version
- manifest version
- entry point
- route count
- host SDK
- minimum host version
- status integrasi

Shell native juga membuat route index dari semua manifest plugin. Route index
ini dipakai oleh Plugin Hub untuk pencarian plugin, package, capability, versi,
status integrasi, dan route host.

Verifier source memeriksa 9 plugin resmi dan memberi warning jika manifest
tidak selaras dengan package. Kondisi yang diketahui saat ini:

- `DA-Dara-Plugin` package `0.1.44`
- `DA-Dara-Plugin` manifest `0.1.45`

Warning ini tidak menghentikan build, tetapi UI Plugin Hub harus menandainya
sebagai mismatch.

## Batas Native Saat Ini

Yang sudah menjadi fondasi native:

- Navigasi shell Kolam, POS, AM, dan Plugin.
- Auth source-aware untuk Kolam/POS/AM.
- Access scope per sesi.
- Dataset unified dengan status per area.
- POS checkout, customer, cashflow, sales, dan workflow guard.
- Kolam dashboard awal dari endpoint finance dan sales graph.
- AM dashboard awal melalui base URL runtime.
- Plugin manifest registry.
- Plugin route explorer untuk 64 route host dari manifest live.
- Runtime action registry untuk module Kolam, POS, AM, dan Plugin.
- Native readiness panel untuk membedakan readiness internal, partial plugin
  mismatch, dan blocker produksi seperti secure storage/toolchain.
- Unified command index untuk module, action, dan route plugin live.
- Sync activity log untuk observability status POS, Kolam, dan AM per refresh.

Yang belum boleh diklaim selesai:

- Build native Windows penuh lewat `npm run windows`.
- Adapter secure storage token Windows untuk auto-login produksi.
- Runtime plugin host lengkap yang mengeksekusi UI plugin di native.
- AM backend public base URL final.

## Toolchain Gate

Gate harian:

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

Gate build native:

```powershell
npm run doctor:windows
npm run windows
```

`doctor:windows` harus lulus sebelum native build dianggap siap. Mesin saat ini
masih membutuhkan .NET SDK dan Visual Studio toolchain lengkap.
