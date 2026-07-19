# Azurda

Azurda adalah aplikasi desktop Windows native berbasis React Native for Windows. Project ini disiapkan untuk menggantikan aplikasi Electron lama tanpa membawa runtime Chromium.

Target produk bukan POS saja. Aplikasi ini adalah shell native gabungan untuk:

- Kolam: operasional, inventory, proyek, task manager, dan panel internal.
- POS: checkout, catalog sellable, sales, customer, payment, dan cashflow.
- AM: automation management dan workflow otomasi.
- Plugin terkait: Bantuan, Chat, Dara, Enclosure, Freyer, KPI, Layanan, Proyek, Task Manager, dan plugin DA lain yang dipakai Kolam.

## Stack

- React Native 0.84
- React Native Windows 0.84
- TypeScript
- C++/WinRT Windows host project

## Sumber Migrasi

Acuan source mutakhir sudah ditarik dari `/home/fito` server Dunia Anura ke:

```powershell
E:\Projects
```

Peta repo acuan ada di `docs/source-repos.md`. Kontrak arsitektur shell
gabungan ada di `docs/architecture.md`.
Goal operasional, termasuk rules reusable UI dan batas file 5000 baris, ada di
`docs/goal.md`.
Audit tampilan Kolam live untuk shell RNW ada di `docs/kolam-visual-audit.md`.

Aplikasi Electron lama yang pertama ditemukan:

```powershell
E:\Projects\da-pos-desktop-ready
```

Project lama ini hanya acuan POS dan sebagian sudah usang. Untuk implementasi berikutnya, gunakan repo live dari `E:\Projects` sebagai sumber utama. Flow POS yang sudah mulai dipetakan ke app native Windows:

- Checkout POS
- Catalog sellable gabungan `Product` dan `Species`
- Cart item dengan quantity dan discount
- Customer wajib untuk sale
- Payment method wajib dan harus terhubung wallet
- Cashflow session wajib open sebelum membuat sale
- Sales list dengan status `draft`, `sent`, `paid`, `cancelled`

Prototype RNW saat ini memakai seed data lokal di `src/data/seed.ts` agar struktur UI dan state siap sebelum koneksi ke backend lama.

## Integrasi Backend

API layer native sudah disiapkan di:

- `src/config/app.ts`
- `src/lib/api-client.ts`
- `src/services/pos-api.ts`
- `src/services/pos-data.ts`
- `src/services/kolam-api.ts`
- `src/services/am-api.ts`
- `src/services/unified-data.ts`

Endpoint yang sudah dipetakan dari aplikasi Electron lama:

- `GET /products?sellable=true`
- `GET /species?sellable=true`
- `GET /customer`
- `GET /payment-method`
- `GET /pos/cashflow/active`
- `GET /sales`
- `POST /sales`

Default app diarahkan ke backend server Kolam yang sudah berjalan (`https://amfibi.dunia-anura.com/api`, `preferLiveApi: true`). Seed hanya fallback UI/test/offline saat server tidak bisa diakses atau user belum punya akses; seed bukan backend lokal dan tidak boleh menjadi runtime production.

Kolam live memakai `https://amfibi.dunia-anura.com/api` dengan header `x-source: Kolam` untuk ringkasan finance dan dashboard sales graph. AM live memakai URL server existing `https://frogs.dunia-anura.com/api`; panel session tetap punya input `URL server AM existing` untuk override runtime jika deployment AM berubah. Loader unified memakai URL itu untuk mencoba `GET /dashboard`.

App shell sekarang sudah punya panel login native:

- Login memakai `POST /auth/signin` dengan selector source Kolam, POS, atau AM.
- Kolam login mengirim body `source: "inventory"` dan header `x-source: Kolam`.
- POS login mengirim body `source: "pos"` dan header `x-source: pos`.
- AM login mengirim body `source: "am"` dan header `x-source: am`; AM access tetap mengikuti gate `access_am` dari source live AM.
- Token disimpan di runtime via `setAccessToken()` dan `getCurrentUser()` memakai header source dari login terakhir.
- Setelah login, shell mencoba memperkaya session dari `GET /auth/detail-user` supaya flag akses terbaru terbaca; jika enrichment gagal, session tetap memakai response login.
- Logout memanggil `POST /auth/logout` dengan header source aktif untuk blacklist token backend, lalu tetap membersihkan session lokal walau request logout gagal.
- Panel session menurunkan access scope dari `access_inventory`, `access_pos`, `access_am`, role `pos`, dan role super administrator agar operator tahu area Kolam/POS/AM yang tersedia.
- Aksi POS native seperti sale draft, open/close cashflow, customer create, dan update status sale sekarang mensyaratkan access scope POS, bukan hanya token login.
- Tombol `Sync` memakai access scope sesi aktif: POS, Kolam, dan AM live hanya dicoba untuk area yang memang tersedia bagi user tersebut.
- Tombol `Sync` mencoba memuat data live dari backend lalu fallback ke seed jika gagal.
- Bar status Sync sekarang menampilkan status per area, misalnya `POS disabled, Kolam live, AM fallback`, agar mode gabungan tidak disederhanakan menjadi hanya seed/live POS.
- Tombol `Buat sale draft` membangun payload `POST /sales` dari cart aktif dengan `channel: "pos"`; `sourceRef` sengaja tidak dikirim agar backend live memakai default offline POS.
- Sidebar sudah menjadi navigasi shell gabungan: Kolam, POS, AM, dan Plugin.
- Dashboard Kolam native sudah memetakan surface live inventory, finance, service, projects, dan storage.
- Dashboard AM native sudah memetakan surface dashboard, tasks, hardware, marketplace, dan operations.
- Dataset unified sekarang memuat POS, ringkasan finance Kolam, sales graph Kolam, dan status dashboard AM dengan fallback terpisah per area.
- Dashboard Kolam native sudah merender ringkasan finance, margin paid sale, wallet, dan sales graph dari dataset unified saat live tersedia.
- Dashboard AM native sudah merender ringkasan account, device, mutasi harian, dan transfer dari dashboard AM lewat URL server AM existing.
- Plugin Hub native sudah mendaftarkan 9 plugin resmi DA beserta package name, versi, capability, dan source repo.
- Plugin Hub native sekarang membaca model manifest host: package version, manifest version, host SDK, route plugin, entry point, dan status integrasi.
- Plugin Hub native sudah punya pencarian plugin dan route explorer untuk menelusuri 64 route host dari manifest live plugin.
- Source live saat ini mencatat satu mismatch: `DA-Dara-Plugin` package `0.1.44`, tetapi manifest `0.1.45`; verifier memberi warning dan UI menandainya `Mismatch`.
- Registry gabungan ada di `src/domain/unified.ts`; URL web lama hanya menjadi referensi migrasi, bukan runtime Electron.
- Registry aksi runtime gabungan ada di `src/domain/runtime-actions.ts`; setiap module shell punya kontrak aksi, source/API, status native/live, dan gate akses Kolam/POS/AM.
- Action strip runtime di UI sudah bisa dipakai untuk memicu sync Kolam/AM, navigasi POS, aksi checkout/cashflow, dan filter audit plugin.
- Panel readiness native menampilkan status coverage shell, action runtime, registry plugin, kontrak live API, secure storage, dan toolchain Windows.
- Unified command index menggabungkan module shell, runtime action, dan 64 route plugin untuk pencarian/navigasi lintas Kolam/POS/AM/plugin.
- Sync activity panel mencatat riwayat POS, Kolam, dan AM dengan status live/fallback/disabled/seed serta pesan error per area.
- Settings Web Settings sudah punya FormSection preview native dari source live: Version, Logo, Company Info, Contact Info, Address, Shipping Origin, Social Media, dan Maintenance Mode.
- Settings Role Management sudah punya role tab strip native seperti live: role name, permission count badge, selected tab, dan flag Full/Default.
- Settings Role Management sudah punya Role Info strip native: nama role, deskripsi, key, badge Full Access/Default, delete visual untuk custom role, dan notice Super Admin.
- Settings Role Management sudah punya permission toggle matrix preview dari source live: group, active/total count, resource status dot, dan action toggles native untuk role/websetting/activity-log.
- Settings Activity Log sudah punya filter bar native dari source live: search path/IP, Type, Status, Method, Source, Suspicious, dan Refresh sebagai kontrak visual sebelum query backend penuh dipasang.
- Settings Activity Log sudah memakai table native dengan kolom live Waktu, User, Source, Tipe, Method, Path, IP, Status, Durasi, dan action detail.
- Settings Activity Log sudah punya detail panel native dari modal live `Detail Log`, berisi field audit utama dan suspicious flags dari preview sync activity.
- Checkout menampilkan guard workflow untuk login kasir, cashflow open, dan cart berisi item.
- Checkout sudah punya selector customer dan payment method dari dataset aktif.
- Modul Cashflow sudah punya aksi `Open cashflow` ke `POST /pos/cashflow/open`.
- Modul Cashflow sudah punya aksi `Close cashflow` ke `POST /pos/cashflow/:id/close`.
- Modul Cashflow sudah punya input nama shift saat open dan close preview dari `GET /pos/cashflow/:id/sales-preview`.
- Modul Customer sudah punya form awal `POST /customer`; customer baru langsung dipilih untuk checkout setelah berhasil dibuat.
- Modul Sales sudah punya aksi status awal ke `PUT /sales/:id/status` untuk `sent`, `paid`, dan `cancelled`.
- Helper checkout payload dipindahkan ke `src/lib/checkout.ts` dan sudah punya unit test untuk mapping product/species.
- Aturan readiness checkout dan transisi status sale dipindahkan ke `src/lib/workflow.ts` dan sudah punya unit test.
- Katalog sudah punya search helper di `src/lib/catalog.ts` dan input pencarian untuk nama, kode, kategori, dan label.
- Checkout sudah punya input diskon global dan shipping dengan parsing angka kasir di `src/lib/checkout.ts`.
- Diskon global dan diskon per baris menormalisasi percentage ke 0-100 agar sesuai validasi backend live.
- Checkout sudah punya empty state katalog/cart dan aksi cepat `Kosongkan` untuk membersihkan cart tanpa mengganti customer/payment.
- Cart item sudah punya kontrol diskon per baris (`Rp` atau `%`) yang ikut masuk ke payload `POST /sales`.

Catatan keamanan: token saat ini belum dipersist ke secure storage Windows. Untuk production, tambahkan penyimpanan native yang aman sebelum mengaktifkan auto-login.
Auth flow sudah dipisahkan lewat `src/services/token-store.ts`, sehingga adaptor
Windows secure storage bisa dipasang tanpa mengubah kontrak login Kolam/POS/AM.

## Lokasi

```powershell
E:\Data\Dunia-Anura\KolamWindows
```

## Jalankan Saat Development

```powershell
npm start
npm run windows
```

Panduan bootstrap lebih lengkap ada di `docs/setup-windows.md`.
Ringkasan arsitektur produk dan kontrak integrasi ada di
`docs/architecture.md`.

## Verifikasi Saat Ini

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

Untuk mengecek kesiapan build native Windows:

```powershell
npm run doctor:windows
```

Doctor mengecek Node, npm, PowerShell 7, .NET SDK, Visual Studio `vswhere`, dan file solution RNW. Saat ini command ini bisa gagal sampai Visual Studio/.NET SDK lengkap dipasang.

## Kebutuhan Toolchain Windows

Untuk build dan run native Windows, mesin perlu:

- Node.js 22 atau lebih baru
- Visual Studio 2022
- Workload Desktop development with C++
- Windows SDK
- .NET SDK
- PowerShell 7 atau lebih baru

Catatan setup awal: `pwsh.exe` sudah direstore ke cache NuGet user agar React Native Windows CLI bisa membuat project `windows/`. Mesin ini masih perlu .NET SDK dan Visual Studio toolchain lengkap sebelum `npm run windows` bisa membangun aplikasi.
