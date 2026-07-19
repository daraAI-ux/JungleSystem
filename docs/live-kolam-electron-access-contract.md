# Live Kolam Electron Access Contract

Kolam live saat ini hanya boleh dianggap dapat diakses melalui aplikasi desktop Electron. React Native Windows tidak boleh mengasumsikan adanya URL web live, WebView utama, atau endpoint UI browser untuk visual comparison.

Gunakan kontrak ini hanya jika visual QA membutuhkan pembukaan Kolam live untuk screenshot atau inspeksi manual/otomatis. Jika kontrak belum diberikan, audit visual RNW tetap harus memakai source live di `E:\Projects\_latest-da\da-inventory-frontend` sebagai acuan utama.

## Required Contract

- `electron_app_path`: path executable atau command launcher Kolam Electron.
- `working_directory`: direktori kerja yang harus dipakai saat menjalankan aplikasi.
- `environment`: env var yang diperlukan, tanpa secret mentah di dokumen repo.
- `profile_mode`: profile aman untuk QA, misalnya `seed`, `staging`, atau `readonly`.
- `login_flow`: apakah perlu login manual, token lokal, atau seed session.
- `allowed_actions`: daftar tindakan yang boleh dilakukan saat QA.
- `blocked_actions`: tindakan yang tidak boleh dilakukan, misalnya submit transaksi, mutate backend live, delete data, sync marketplace, atau broadcast plugin.
- `screenshots_required`: daftar layar yang perlu dibandingkan dengan RNW.
- `exit_procedure`: cara menutup aplikasi dan membersihkan session QA.

## Minimum Screenshots

- Dashboard first screen setelah login.
- Sidebar expanded.
- Sidebar collapsed/dock.
- Top nav notification popup.
- Avatar dropdown.
- Product/catalog list dengan search.
- Sales/cashflow table atau list.
- Form cashflow/customer.
- Settings panel.
- Plugin-related surface jika tersedia di Electron.

## Visual Comparison Rules

- RNW harus dibandingkan terhadap layout operasional Kolam, bukan halaman marketing.
- Fokus utama: sidebar, top nav, dashboard, cards, table/list, form, empty state, command/search, status panel, dan plugin surface.
- Jika Electron dan source live berbeda, catat perbedaannya dan prioritaskan source live mutakhir kecuali user memberi instruksi bahwa Electron adalah sumber kebenaran visual untuk area itu.
- Jangan melakukan tindakan destruktif atau write operation saat visual QA kecuali user memberi approval eksplisit.

## Current State

Kontrak runtime Electron belum diberikan. Sampai kontrak tersedia, pekerjaan visual RNW berlanjut berbasis source live:

- `E:\Projects\_latest-da\da-inventory-frontend`
- `E:\Projects\da-inventory-backend`
- `E:\Projects\da-pos`
- `E:\Projects\da-automation-management`
- `E:\Projects\DA-*-Plugin`
