# Kolam Windows Goal

Dokumen ini adalah kontrak kerja operasional untuk pengembangan Kolam Windows.
Active Codex goal bisa berubah di luar repo, tetapi file ini harus menjadi
pegangan lokal yang mudah dibaca oleh agen berikutnya.

## Tujuan Produk

- Bangun aplikasi Windows desktop native berbasis React Native Windows.
- Gantikan akses Kolam Electron tanpa menjadikan Electron atau WebView sebagai
  runtime utama.
- Aplikasi adalah gabungan Kolam, POS, Automation Management, dan plugin hub.
- Tampilan dan perilaku harus mengikuti Kolam FE terbaru.
- Arsitektur UI harus lebih reusable, stabil, dan konsisten daripada FE lama.

## Source Acuan

- App RN Windows: `E:\Data\Dunia-Anura\KolamWindows`
- FE Kolam terbaru: `E:\Projects\_latest-da\da-inventory-frontend`
- BE snapshot terbaru: `E:\Projects\_latest-da\da-inventory-backend`
- POS: `E:\Projects\da-pos`
- AM: `E:\Projects\da-automation-management`
- Plugin: `E:\Projects\DA-*-Plugin`
- Jangan gunakan `E:\Projects\da-pos-desktop-ready` kecuali sebagai catatan
  historis.

## Backend Runtime

- Runtime KolamWindows harus memakai backend server yang sedang berjalan.
- Jangan membuat backend lokal baru.
- Jangan menjalankan atau mengandalkan BE lokal sebagai runtime.
- BE snapshot hanya boleh dipakai read-only untuk memahami kontrak API,
  middleware, auth flow, header, dan bentuk payload.
- Config development tidak boleh mengarah ke `localhost`, `127.0.0.1`, atau
  backend lokal.
- Jika akses server ditolak karena client gate, audit NGINX/middleware secara
  read-only dulu.
- Perubahan server produksi harus minimal: hanya menambahkan aplikasi Windows
  native sebagai client resmi kedua tanpa merusak akses Electron.
- Server harus tetap hanya menerima client resmi: Electron lama dan aplikasi
  Windows native baru.

## Reusable UI Rules

- FE lama adalah referensi visual dan behavior, bukan pola arsitektur yang
  ditiru mentah-mentah.
- Semua tombol dan press target wajib melewati primitive bersama.
- Primitive dasar interaksi adalah `KolamPressable`.
- Tombol umum harus memakai atau memperluas primitive seperti:
  `KolamButton`, `KolamIconButton`, `KolamActionButton`, `KolamSegment`,
  `KolamSwitch`, `KolamSelectorChip`, `KolamPaginationItem`, dan
  `KolamQuantityStepper`.
- Modul tidak boleh membuat tombol/control ad hoc jika primitive yang ada bisa
  dipakai atau diperluas.
- Jika pola baru berulang, tambah variant/prop terkontrol di shared primitive,
  bukan copy-paste style lokal.
- Control umum seperti input, select, tabs, badge, card, table row, sidebar
  item, toolbar, menu item, modal, empty state, command item, dan filter chip
  harus reusable.

## File Size Rules

- File baru ditargetkan maksimal 5000 baris.
- File yang disentuh untuk refactor juga ditargetkan maksimal 5000 baris setelah
  refactor selesai.
- Jika satu fitur melewati 5000 baris, pecah ke file domain, component, hook,
  service, helper, atau test yang lebih kecil.
- File lama yang sudah telanjur besar tidak boleh makin membesar tanpa alasan
  kuat.
- Saat menyentuh file besar lama, pindahkan bagian yang jelas berdiri sendiri
  ke file baru yang kecil dan reusable.
- `App.tsx` harus diperlakukan sebagai file legacy besar yang dikurangi
  bertahap, bukan tempat menumpuk UI baru.
- Test juga harus dipecah per domain/component agar mudah dibaca dan dicari.

## Visual Parity

- Ambil token, spacing, radius, warna, typography, state hover/active/disabled,
  table behavior, sidebar grouping, card spacing, dan dashboard layout dari FE
  terbaru.
- Jika FE lama tidak konsisten, pilih pola yang paling sering dipakai atau yang
  paling dekat dengan design system live.
- Dokumentasikan visual contract di `src/domain/*` dan test terkait supaya
  tidak hilang.

## Source Management

- Jangan pull langsung ke repo lama yang diverged atau dirty jika berisiko
  merusak perubahan lokal.
- Gunakan snapshot/worktree aman di `E:\Projects\_latest-da`.
- Jika butuh update terbaru, fetch server dulu lalu update snapshot/worktree
  dengan cara aman.
- Jangan reset, checkout paksa, atau hapus perubahan user tanpa izin eksplisit.

## Verification Gates

Setelah perubahan kode, jalankan gate yang relevan:

```powershell
npm.cmd run typecheck
npm.cmd test -- --runInBand
npm.cmd run lint
npm.cmd run test:windows -- --runInBand
npm.cmd run verify:file-size
npm.cmd run verify:live-routes
npm.cmd run verify:shell-routes
npm.cmd run verify:runtime-backend
npm.cmd run verify:sources
npm.cmd run verify:registry
```

Catatan:

- `test:windows` bisa pass sambil memberi warning `dotnet.exe is not
  recognized`; itu belum membuktikan native build toolchain siap.
- `verify:live-routes` membandingkan route `page.tsx` FE live di
  `E:\Projects\_latest-da\da-inventory-frontend\src\app\(app)` dengan registry
  route native.
- `verify:shell-routes` membandingkan page POS dan AM source dengan shell route
  native agar coverage luas tetap hidup sebelum visual detail dikerjakan.
- `verify:runtime-backend` memastikan runtime memakai server existing dan
  mengirim identitas client `kolam-windows`, bukan backend lokal.
- `verify:sources` dan `verify:registry` bisa pass dengan warning DA-Dara
  package `0.1.44` tidak sama dengan manifest `0.1.45`.

## Definition Of Done

- Aplikasi RN Windows membuka seluruh surface Kolam + POS + AM + plugin dulu,
  lalu visual bisa diubah setelah coverage aplikasi hidup.
- UI memakai reusable primitives, bukan tombol/control ad hoc.
- Behavior penting dari FE lama tetap terbaca.
- Runtime mengarah ke backend server berjalan, bukan backend lokal.
- Tidak ada perubahan production server tanpa audit dan alasan jelas.
- File baru/refactor tetap kecil, terpisah, dan mudah dibaca.
- Gate yang relevan pass, atau blocker dijelaskan spesifik.
