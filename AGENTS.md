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

### App Context API (setelah state dipecah dari App)

State bersama sudah dipecah ke Context. `App.tsx` hanya composition root (`KolamAppStateProvider` + `KolamAppRoot`). Definisi hook: `src/context/kolam-app-contexts.tsx`. Provider wiring: `src/context/kolam-app-state-provider.tsx`.

| Hook | Pakai untuk |
|------|-------------|
| `useKolamAuthContext` | session user, credentials form, sign-in/out, device identity |
| `useKolamDataContext` | `dataset`, sync activity, refresh unified data |
| `useKolamNavigationContext` | module/route aktif, settings tab, chat rail |
| `useKolamShellChromeContext` | sidebar / top nav / overlay / dashboard header (chrome saja) |
| `useKolamWorkspaceViewContext` | props workspace + runtime surface |

Wajib untuk agen halaman baru:

1. Butuh data/session/nav bersama → **panggil Context hook di atas** dari surface/hook modul (atau host kecil modul itu).
2. **Jangan** menambah `useState` / controller baru di `App.tsx` atau memperbesar `KolamAppStateProvider` hanya untuk state lokal halaman.
3. **Jangan** meneruskan state halaman lewat prop bag baru dari `App` → shell → workspace jika Context atau state modul sudah cukup.
4. State khusus halaman (list, form draft, pagination, search lokal) tetap di **surface / hook modul**, bukan di Context global, kecuali user menyetujui scope bersama secara eksplisit.
5. Jangan menghapus / menggabungkan Context split atau memo shell/workspace tanpa approval.

## Component Reuse (anti-duplication)

Aturan ini melengkapi proteksi di atas. Tidak menghapus atau melemahkan rule existing (termasuk larangan extract shared / ubah reusable tanpa approval).

Tujuan: cegah kelemahan FE Kolam — terlalu banyak komponen berbeda yang fungsi/UI-nya sama — agar tidak diulang di RNW.

### Wajib sebelum membuat komponen baru

1. **Audit reuse dulu (audit-only).** Cari di `src/components/` (dan hook/domain terkait) apakah sudah ada komponen / primitif / pola dengan **fungsi sama atau sangat mirip** (button, row, field, toggle, dialog, table frame, status badge, list row, card frame, dll.).
2. Di proposal sebelum coding, sebutkan:
   - kandidat reuse yang ditemukan (path file), atau
   - bukti singkat bahwa **tidak ada** yang cocok.
3. **Default: reuse atau extend** komponen/pritimif existing (props opsional, variant, composition), bukan file komponen baru.
4. Jangan meng-copy struktur/JSX/style dari FE Kolam menjadi komponen RNW baru jika di repo ini sudah ada padanan fungsi yang sama.

### Kapan komponen baru boleh dibuat

Komponen baru hanya jika **semua** ini benar, dan user sudah approve:

1. Tidak ada komponen existing yang menutupi use case tanpa merusak API/behavior pemakai lain, **atau**
2. Perbedaan perilaku/visual cukup material sehingga memaksa shared component akan melanggar proteksi modul lain,
3. Dan di proposal dijelaskan mengapa reuse/extend ditolak.

“Terlihat mirip di FE web” atau “lebih cepat buat file baru” **bukan** alasan cukup.

### Yang tetap dilarang (rule lama tetap berlaku)

1. **Extract / merge** banyak pemakai menjadi shared component baru **tanpa approval** — tetap dilarang.
2. Mengubah reusable component yang sudah dipakai luas **tanpa approval khusus** — tetap dilarang.
3. Refactor opportunistic “sekalian dedupe seluruh app” di luar scope — tetap dilarang.
4. Menyentuh Species/Product/modul lain hanya karena mau reuse — tetap butuh disebut eksplisit + approval.

### Alur yang diizinkan

| Situasi | Tindakan |
|--------|----------|
| Ada komponen cocok | Reuse apa adanya |
| Hampir cocok, butuh 1–2 props | Extend komponen itu (dengan approval jika file reusable/shared) |
| Cocok tapi ubah akan rusak pemakai lain | STOP → usulkan opsi (wrapper lokal vs extract baru) → tunggu approval |
| Tidak ada yang cocok | Komponen baru di scope modul, setelah audit reuse dilaporkan |

### Agen yang membangun halaman paralel

1. Jangan menambah “satu set widget lokal” (button/row/field/dialog) jika shell/katalog sudah punya padanan.
2. Jika ragu komponen mana yang benar: STOP, audit-only, tanya user — jangan menduplikasi “untuk amannya”.
3. Dedup/extract massal hanya jika user meminta eksplisit sebagai task tersendiri.

## WebView2 / TipTap (Windows performance)

Aturan ini melengkapi proteksi di atas. Tidak menghapus atau melemahkan rule existing.

Pada Windows, setiap `WebView` dengan `useWebView2` = **satu proses WebView2** (RAM/CPU mahal). TipTap editor memakai bundle besar (~438 KB) per mount.

### Wajib sebelum menambah WebView2

1. **Audit reuse dulu.** Cari host/pola existing:
   - TipTap rich text: `KolamTipTapRichTextEditor` + bila banyak field: `KolamTipTapExclusiveGroup` / `KolamTipTapExclusiveField` (`src/components/kolam-tiptap-exclusive-host.tsx`)
   - Media: `KolamMediaPlayer` / preview host
   - Jangan buat WebView “sekalian” untuk HTML statis jika `KolamHtmlContent` / native View cukup
2. Di proposal sebelum coding, sebutkan: berapa WebView2 yang akan hidup **bersamaan**, dan mengapa tidak bisa 1 host.
3. **Default: maksimal satu TipTap WebView2 aktif per form/group.** Field rich-text lain memakai preview ringan sampai diaktifkan (pola exclusive host).
4. Jangan mount N TipTap bersamaan hanya karena N field (contoh anti-pola: description + morfologis + habitat = 3 WebView2).

### Batasan umum WebView2

1. Jangan menambah WebView2 di shell chrome (sidebar/top nav) atau di list row yang di-virtualisasi/banyak.
2. Unmount WebView saat dialog/surface tidak terlihat jika tidak wajib keep-alive.
3. Jangan me-load TipTap bundle di WebView yang bukan editor TipTap.
4. Media player / print WebView tetap terpisah dari TipTap host; jangan digabung sembarangan tanpa approval.
5. Jika butuh WebView2 baru di luar pola di atas: STOP, audit-only, tanya user — sebutkan alternatif native dulu.

### Agen halaman baru yang butuh editor kaya / WebView

1. Rich text → `KolamTipTapRichTextEditor`; jika ≥2 field di layar yang sama → bungkus `KolamTipTapExclusiveGroup`.
2. Preview HTML read-only → prefer `KolamHtmlContent` (bukan WebView2), kecuali requirement eksplisit.
3. Jangan copy pola FE web yang me-mount banyak editor sekaligus tanpa mempertimbangkan biaya WebView2 di RNW.
