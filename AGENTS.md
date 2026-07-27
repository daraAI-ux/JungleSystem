# Project-Wide Protection Rule

Semua file, modul, komponen, behavior, style, data flow, dan fitur existing di aplikasi ini adalah protected by default.

## Local Source Repositories

Sebelum membandingkan UI, API, atau behavior Kolam, agen wajib memakai repo lokal berikut sebagai source of truth/read-only terlebih dahulu:

- FE Kolam lokal: `E:\Projects\da-inventory-frontend`
- BE Kolam lokal: `E:\Projects\da-inventory-backend`
- FE raw material detail: `E:\Projects\da-inventory-frontend\src\app\(app)\raw-materials\[id]\raw-material-detail.tsx`

Jangan menebak dari memori atau dari hasil implementasi RN saja. Jika path tidak ditemukan, laporkan sebagai blocker dan jangan mengarang fallback.

Agen tidak boleh:
- mengubah file apa pun di luar scope eksplisit
- refactor opportunistic
- cleanup "sekalian"
- extract shared component tanpa approval
- mengubah modul lain karena terlihat mirip
- menghapus fitur existing
- mengganti UI yang sudah benar
- mengubah naming/API/props existing tanpa approval
- menyentuh Species/Product/modul lain kecuali disebut eksplisit
- "memperbaiki" hal yang tidak diminta

Sebelum coding:
1. Audit-only.
2. Sebutkan file yang akan dibaca.
3. Sebutkan file yang akan disentuh.
4. Sebutkan behavior existing yang akan dipertahankan.
5. Sebutkan risiko regresi.
6. Tunggu approval eksplisit.

Saat coding:
1. Hanya sentuh file yang disetujui.
2. Jika menemukan kebutuhan di luar scope, STOP.
3. Jangan patch tambahan.
4. Jangan mengubah desain global.
5. Jangan mengubah reusable component tanpa approval khusus.

Setelah coding:
1. Laporkan file yang berubah.
2. Laporkan fitur yang dipertahankan.
3. Jalankan test/typecheck sesuai scope.
4. Reload atau rebuild aplikasi jika perlu agar perubahan terlihat. Jika rebuild tidak diperlukan, cukup reload.
5. Jangan lanjut section berikutnya tanpa approval.

## App Shell vs Workspace State (performance)

Aturan ini melengkapi proteksi di atas. Tidak menghapus atau melemahkan rule existing.

### Batas tanggung jawab

- **Shell** = chrome tetap: sidebar, top navigation, overlay (command palette / user menu / attention), dashboard header frame.
- **Workspace** = isi halaman modul aktif (Product, Species, POS, Settings surface, plugin, dll.).
- **App.tsx** = composition root / wiring. Bukan tempat default untuk state halaman baru.

### Wajib untuk halaman / fitur baru

1. State, fetch, dan controller halaman baru hidup di **surface / hook modul itu sendiri** (atau provider scoped modul), bukan ditambahkan sebagai `useState` / controller baru di `App.tsx`, kecuali user menyetujui wiring root secara eksplisit.
2. Jangan meneruskan state yang sering berubah (poll, keystroke search, pagination, form draft) lewat prop bag root `App` → shell → workspace jika update itu hanya dibutuhkan satu sisi.
3. Poll / timer / metrics host harus diisolasi di komponen kecil yang merender UI terkait (contoh pola: `KolamServerMetricsStripHost`), agar `setState` tidak memaksa re-render seluruh `App` / workspace.
4. Jika boundary shell vs workspace sudah memakai `React.memo` / context split, **jangan dihapus** dan jangan bypass dengan prop object baru yang dibuat inline di `App` setiap render tanpa alasan.
5. Halaman baru menempel ke **workspace route/surface registry** yang existing. Jangan memasukkan pohon halaman penuh ke dalam shell chrome.

### Saat menyentuh App / shell / workspace bersama

1. Tetap ikuti alur audit → daftar file → approval. Refactor “pecah state App” atau “memo shell vs workspace” hanya jika diminta eksplisit.
2. Jangan refactor opportunistic seluruh `App.tsx` hanya karena menambah satu halaman.
3. Jika terpaksa menambah wiring di `App`, sebutkan di proposal: prop apa, mengapa tidak bisa di modul, dan risiko re-render.
4. Prefer pola yang sudah ada di repo (controller per modul, host isolasi) daripada arsitektur baru tanpa approval.

### Agen lain yang membangun halaman paralel

1. Anggap kontrak shell/workspace di atas sebagai source of truth untuk peletakan state.
2. Jangan “meniru” menumpuk hook di `App.tsx` hanya karena file itu historis masih berisi banyak controller.
3. Jika pola peletakan state tidak jelas: STOP, audit-only, tanya user — jangan menebak atau merombak App.
4. Setelah batch perubahan disetujui dan selesai: **buat git commit** untuk batch itu (jangan menumpuk banyak fitur tak terkait dalam satu commit), kecuali user meminta menunda commit. Jangan `git push` kecuali diminta eksplisit.
