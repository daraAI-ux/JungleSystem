# Source Repo Map

Source mutakhir dari server Dunia Anura sudah diambil dari `/home/fito` ke `E:\Projects`.

## Scope App Gabungan

Kolam Windows harus menjadi satu aplikasi native Windows untuk:

- Kolam: panel operasional internal.
- POS: checkout, sales, customer, payment, dan cashflow.
- AM: automation management.
- Plugin DA: modul plugin yang berjalan di Kolam.

## Repo Utama

| Area | Repo lokal | Catatan |
| --- | --- | --- |
| Desktop lama | `E:\Projects\da-desktop-apps` | Monorepo Electron resmi; punya `apps/kolam-da` dan `apps/pos-da`. |
| Kolam live | `E:\Projects\_latest-da\da-inventory-frontend` | Snapshot frontend Kolam mutakhir hasil fetch server dari `/home/fito/merger/da-inventory-frontend`; branch server ada di `da-server/*`. |
| Kolam BE live | `E:\Projects\_latest-da\da-inventory-backend` | Snapshot backend Kolam mutakhir untuk membaca kontrak API/middleware secara read-only. |
| Backend live | `E:\Projects\da-inventory-backend` | Backend API mutakhir dari `/home/fito/merger/da-inventory-backend`; branch server ada di `da-server/*`. |
| POS live | `E:\Projects\da-pos` | Source POS mutakhir dari `/home/fito/da-pos`; branch server ada di `da-server/main`. |
| AM | `E:\Projects\da-automation-management` | Automation management dari `/home/fito/da-automation-management`. |
| Ops Kolam | `E:\Projects\kolam-ops` | Script operasional Kolam dan deploy plugin. |
| Marketplace | `E:\Projects\da-marketplace` | Marketplace/web store, branch server ada di `da-server/*`. |
| AI | `E:\Projects\da-ai-service`, `E:\Projects\dara-ai` | Service AI dan Dara AI. |

## Plugin Terkait

| Plugin | Repo lokal |
| --- | --- |
| Bantuan | `E:\Projects\DA-Bantuan-Plugin` |
| Chat | `E:\Projects\DA-Chat-Plugin` |
| Dara | `E:\Projects\DA-Dara-Plugin` |
| Enclosure | `E:\Projects\DA-Enclosure-Plugin` |
| Freyer | `E:\Projects\DA-Freyer-Plugin` |
| KPI | `E:\Projects\DA-KPI-Plugin` |
| Layanan | `E:\Projects\DA-Layanan-Plugin` |
| Proyek | `E:\Projects\DA-Proyek-Plugin` |
| Task Manager | `E:\Projects\DA-Task-Manager-Plugin` |

## Sinkronisasi Yang Dilakukan

- Repo yang belum ada lokal sudah di-clone dari git bundle server.
- Repo yang sudah ada lokal tidak di-merge paksa karena punya perubahan lokal.
- Untuk repo yang sudah ada, refs server di-fetch ke `da-server/*`.
- Bundle server tersimpan sementara di `E:\Projects\_da_server_bundles`.

## Catatan Implementasi

- `E:\Projects\da-pos-desktop-ready` hanya fallback historis POS, bukan sumber utama.
- Untuk fitur Kolam dan plugin, prioritaskan `E:\Projects\_latest-da\da-inventory-frontend`, plugin repos, dan `kolam-ops`.
- Untuk AM, prioritaskan `da-automation-management`.
- Untuk kontrak API, prioritaskan `da-inventory-backend`.

## Registry Native Unified

`src/domain/unified.ts` menyimpan registry permukaan operasi yang dipakai oleh
shell React Native Windows:

- Kolam: inventory, finance, service, projects, dan storage.
- AM: dashboard, tasks, hardware, marketplace, dan operations.
- Plugin: 9 package resmi DA beserta versi yang ditemukan di `package.json`
  masing-masing repo.

URL web lama tetap dicatat di `src/config/app.ts` sebagai referensi migrasi,
tetapi UI target tetap native Windows dan tidak menjalankan Electron.
