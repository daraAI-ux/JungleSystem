/* eslint-disable prettier/prettier */
// Generated from DA-Bantuan-Plugin dist (split for lazy load).
// Regenerate/split after Bantuan plugin content is rebuilt.

import type {KolamBantuanManifest} from '../domain/kolam-bantuan';

export const kolamBantuanLocalManifest = {
  "version": "0.1.1",
  "generatedAt": "2026-08-05T14:53:38.454Z",
  "aliases": {
    "chat": "dara-chat-01-ringkasan",
    "dara-ai": "dara-chat-01-ringkasan",
    "webstore": "webstore-01-ringkasan"
  },
  "modules": [
    {
      "slug": "beranda-label-field",
      "title": "Beranda & Label Field",
      "description": "Panduan Beranda (dashboard), menu Label & Field — Merek, Kategori, Tag, Field kustom, Satuan — untuk pengguna dan handover programmer.",
      "docPath": "modul/beranda-label-field.md",
      "version": "1.2",
      "updatedAt": "2026-06-29",
      "kind": "core",
      "permissionResources": [
        "brand",
        "category",
        "tag",
        "custom-field",
        "units"
      ]
    },
    {
      "slug": "cashflow-session",
      "title": "Cashflow Session (Admin & POS)",
      "description": "Panduan lengkap sesi kas — admin harian Kolam vs shift POS kasir, deposit, verifikasi, wallet, troubleshooting, backfill, dan handover programmer.",
      "docPath": "modul/cashflow-session.md",
      "version": "1.0",
      "updatedAt": "2026-06-15",
      "kind": "core",
      "permissionResources": [
        "wallet",
        "sale"
      ]
    },
    {
      "slug": "garansi-produk",
      "title": "Garansi Produk",
      "description": "Garansi produk katalog (distributor resmi & DA) — setup produk/supplier, webstore, klaim customer, staff Kolam, invoice, dan import marketplace.",
      "docPath": "modul/garansi-produk.md",
      "version": "1.1",
      "updatedAt": "2026-07-12",
      "kind": "core",
      "permissionResources": [
        "product",
        "complaint",
        "vendor"
      ]
    },
    {
      "slug": "species",
      "title": "Life Stock (Spesies)",
      "description": "Panduan modul Spesies — katalog life stock, varian, stok, media, enclosure, marketplace sync, export — untuk pengguna dan handover programmer.",
      "docPath": "modul/species.md",
      "version": "1.1",
      "updatedAt": "2026-06-29",
      "kind": "core",
      "permissionResource": "species"
    },
    {
      "slug": "plugin-split-chat-dara",
      "title": "Pemisahan Plugin Chat vs DARA",
      "description": "Status produksi pemisahan plugin messaging (chat) dari plugin DARA (SEO, Tax, Market Intel). Roadmap S0–S7 selesai.",
      "docPath": "modul/plugin-split-chat-dara.md",
      "version": "2.6",
      "updatedAt": "2026-06-23",
      "kind": "core",
      "permissionResources": [
        "websetting",
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax"
      ]
    },
    {
      "slug": "pengiriman",
      "title": "Pengiriman — Ringkasan",
      "description": "Ringkasan pengiriman Kolam 2026 — operasi di detail sales (Biteship, marketplace), master data, dan webstore.",
      "docPath": "modul/pengiriman.md",
      "version": "2.2",
      "updatedAt": "2026-06-26",
      "kind": "core",
      "permissionResources": [
        "shipping_method",
        "sale"
      ],
      "seriesId": "pengiriman",
      "seriesTitle": "Pengiriman",
      "pageOrder": 1,
      "navLabel": "Ringkasan",
      "seriesPageIndex": 1,
      "seriesPageCount": 5,
      "nextSlug": "pengiriman-02-biteship-di-sales"
    },
    {
      "slug": "pengiriman-02-biteship-di-sales",
      "title": "Pengiriman — Biteship di Detail Sales",
      "description": "Request pickup, drop-off, reschedule, panel tracking, POD, dan polling status Biteship di halaman detail penjualan.",
      "docPath": "modul/pengiriman-02-biteship-di-sales.md",
      "version": "2.3",
      "updatedAt": "2026-07-04",
      "kind": "core",
      "permissionResources": [
        "shipping_method",
        "sale"
      ],
      "seriesId": "pengiriman",
      "seriesTitle": "Pengiriman",
      "pageOrder": 2,
      "navLabel": "Biteship di Sales",
      "seriesPageIndex": 2,
      "seriesPageCount": 5,
      "prevSlug": "pengiriman",
      "nextSlug": "pengiriman-03-marketplace-timeline-pod"
    },
    {
      "slug": "pengiriman-03-marketplace-timeline-pod",
      "title": "Pengiriman — Marketplace Timeline & POD",
      "description": "Pickup Shopee/Tokopedia, timeline logistik, proof of delivery, dan sinkronisasi AM di detail Sales.",
      "docPath": "modul/pengiriman-03-marketplace-timeline-pod.md",
      "version": "2.3",
      "updatedAt": "2026-06-26",
      "kind": "core",
      "permissionResources": [
        "shipping_method",
        "sale"
      ],
      "seriesId": "pengiriman",
      "seriesTitle": "Pengiriman",
      "pageOrder": 3,
      "navLabel": "Marketplace olshop",
      "seriesPageIndex": 3,
      "seriesPageCount": 5,
      "prevSlug": "pengiriman-02-biteship-di-sales",
      "nextSlug": "pengiriman-04-master-webstore"
    },
    {
      "slug": "pengiriman-04-master-webstore",
      "title": "Pengiriman — Master Data & Webstore",
      "description": "Metode pengiriman, katalog Biteship, asal kirim, geocode alamat, checkout webstore, dan env.",
      "docPath": "modul/pengiriman-04-master-webstore.md",
      "version": "2.0",
      "updatedAt": "2026-06-18",
      "kind": "core",
      "permissionResources": [
        "shipping_method",
        "sale"
      ],
      "seriesId": "pengiriman",
      "seriesTitle": "Pengiriman",
      "pageOrder": 4,
      "navLabel": "Master & webstore",
      "seriesPageIndex": 4,
      "seriesPageCount": 5,
      "prevSlug": "pengiriman-03-marketplace-timeline-pod",
      "nextSlug": "pengiriman-05-shopee-pickup-eligibility"
    },
    {
      "slug": "pengiriman-05-shopee-pickup-eligibility",
      "title": "Pengiriman — Shopee Pickup & Drop-off (Eligibility)",
      "description": "Kapan tombol Request jemput kurir / Reschedule / Antar ke counter Shopee muncul; deteksi drop-off generik via channel cache; bug fix Juni 2026.",
      "docPath": "modul/pengiriman-05-shopee-pickup-eligibility.md",
      "version": "1.3",
      "updatedAt": "2026-06-28",
      "kind": "core",
      "permissionResources": [
        "shipping_method",
        "sale"
      ],
      "seriesId": "pengiriman",
      "seriesTitle": "Pengiriman",
      "pageOrder": 5,
      "navLabel": "Shopee pickup eligibility",
      "seriesPageIndex": 5,
      "seriesPageCount": 5,
      "prevSlug": "pengiriman-04-master-webstore"
    },
    {
      "slug": "proyek",
      "title": "Proyek",
      "description": "Panduan custom project lifecycle, pembayaran, Task Manager, desain, HPP, UE, komisi, RBAC, dan penutupan.",
      "docPath": "modul/proyek.md",
      "version": "2.3",
      "updatedAt": "2026-06-22",
      "kind": "core",
      "permissionResources": [
        "custom-project",
        "sale"
      ]
    },
    {
      "slug": "sales-01-ringkasan",
      "title": "Sales — Ringkasan & Arsitektur",
      "description": "Modul penjualan Kolam — rute, status, peran staff vs customer, integrasi marketplace, pengiriman, dan DARA fulfillment.",
      "docPath": "modul/sales-01-ringkasan.md",
      "version": "1.0",
      "updatedAt": "2026-06-18",
      "kind": "core",
      "permissionResources": [
        "sale"
      ],
      "seriesId": "sales",
      "seriesTitle": "Sales (Penjualan)",
      "pageOrder": 1,
      "navLabel": "Ringkasan",
      "seriesPageIndex": 1,
      "seriesPageCount": 5,
      "nextSlug": "sales-02-daftar-dan-filter"
    },
    {
      "slug": "sales-02-daftar-dan-filter",
      "title": "Sales — Daftar & Filter",
      "description": "Halaman /sales — pencarian, filter status bayar/kirim, lifecycle, needsAction, export, dan aksi baris.",
      "docPath": "modul/sales-02-daftar-dan-filter.md",
      "version": "1.4",
      "updatedAt": "2026-07-11",
      "kind": "core",
      "permissionResources": [
        "sale"
      ],
      "seriesId": "sales",
      "seriesTitle": "Sales (Penjualan)",
      "pageOrder": 2,
      "navLabel": "Daftar & filter",
      "seriesPageIndex": 2,
      "seriesPageCount": 5,
      "prevSlug": "sales-01-ringkasan",
      "nextSlug": "sales-03-buat-edit-status"
    },
    {
      "slug": "sales-03-buat-edit-status",
      "title": "Sales — Buat, Edit & Status",
      "description": "Form create/edit sales, aturan edit setelah paid, tambah item, diskon approval, dan transisi status.",
      "docPath": "modul/sales-03-buat-edit-status.md",
      "version": "1.0",
      "updatedAt": "2026-06-18",
      "kind": "core",
      "permissionResources": [
        "sale"
      ],
      "seriesId": "sales",
      "seriesTitle": "Sales (Penjualan)",
      "pageOrder": 3,
      "navLabel": "Buat & edit",
      "seriesPageIndex": 3,
      "seriesPageCount": 5,
      "prevSlug": "sales-02-daftar-dan-filter",
      "nextSlug": "sales-04-detail-pembayaran"
    },
    {
      "slug": "sales-04-detail-pembayaran",
      "title": "Sales — Detail Invoice & Pembayaran",
      "description": "Layout SalesInvoice, bukti bayar, wallet, margin internal, garansi, T&C, cetak invoice/resi.",
      "docPath": "modul/sales-04-detail-pembayaran.md",
      "version": "1.3",
      "updatedAt": "2026-07-06",
      "kind": "core",
      "permissionResources": [
        "sale"
      ],
      "seriesId": "sales",
      "seriesTitle": "Sales (Penjualan)",
      "pageOrder": 4,
      "navLabel": "Detail & bayar",
      "seriesPageIndex": 4,
      "seriesPageCount": 5,
      "prevSlug": "sales-03-buat-edit-status",
      "nextSlug": "sales-05-komplain-dara-fulfillment"
    },
    {
      "slug": "sales-05-komplain-dara-fulfillment",
      "title": "Sales — Komplain, Marketplace & DARA",
      "description": "Jendela komplain, externalRef marketplace, panel DARA fulfillment di detail sale, dan handover integrasi.",
      "docPath": "modul/sales-05-komplain-dara-fulfillment.md",
      "version": "1.2",
      "updatedAt": "2026-07-09",
      "kind": "core",
      "permissionResources": [
        "sale"
      ],
      "seriesId": "sales",
      "seriesTitle": "Sales (Penjualan)",
      "pageOrder": 5,
      "navLabel": "Komplain & DARA",
      "seriesPageIndex": 5,
      "seriesPageCount": 5,
      "prevSlug": "sales-04-detail-pembayaran"
    },
    {
      "slug": "settings",
      "title": "Settings & Peran",
      "description": "Panduan Settings sistem, tab web/AI/peran/plugin, RBAC view, activity log — handover programmer & pengguna.",
      "docPath": "modul/settings.md",
      "version": "1.5",
      "updatedAt": "2026-08-05",
      "kind": "core",
      "permissionResources": [
        "websetting",
        "role",
        "activity-log"
      ]
    },
    {
      "slug": "komisi",
      "title": "Sistem Komisi",
      "description": "Panduan komisi penjualan, langganan layanan, custom project — VAR, pembagian PIC/DA/pool, finance, wallet, portal karyawan, RBAC, handover programmer.",
      "docPath": "modul/komisi.md",
      "version": "1.6",
      "updatedAt": "2026-07-26",
      "kind": "core",
      "permissionResources": [
        "commission",
        "wallet",
        "sale",
        "payroll"
      ]
    },
    {
      "slug": "plugin-kolam",
      "title": "Sistem Plugin Kolam",
      "description": "Arsitektur plugin, registry, deploy tanpa build FE, dan kapan build Kolam masih diperlukan.",
      "docPath": "modul/plugin-kolam.md",
      "version": "1.4",
      "updatedAt": "2026-06-22",
      "kind": "core",
      "permissionResources": [
        "websetting"
      ]
    },
    {
      "slug": "stock-opname",
      "title": "Stock Opname",
      "description": "Panduan menghitung, mereview, dan memposting stok Produk, Raw material, Livestock, serta Kemasan.",
      "docPath": "modul/stock-opname.md",
      "version": "1.0",
      "updatedAt": "2026-07-15",
      "kind": "core",
      "permissionResources": [
        "stock-opname"
      ]
    },
    {
      "slug": "tag",
      "title": "Tag (Label Katalog)",
      "description": "Modul Tag Kolam — master data label warna, pemakaian di produk/species/layanan, webstore, SEO/DARA, dan integrasi modul terkait.",
      "docPath": "modul/tag.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "core",
      "permissionResource": "tag"
    },
    {
      "slug": "enclosure",
      "title": "DA-Enclosure-Plugin",
      "description": "Panduan Enclosure — livestock, alokasi penjualan, populasi (kematian/hilang/teradopsi), badge gap, task, handover programmer.",
      "docPath": "plugins/enclosure.md",
      "version": "1.31",
      "updatedAt": "2026-07-11",
      "kind": "plugin",
      "pluginId": "enclosure",
      "permissionResource": "enclosure"
    },
    {
      "slug": "freyer",
      "title": "DA-Freyr-Plugin",
      "description": "Panduan Teranura & Freyr katalog perangkat, IoT staff, dashboard pelanggan, sunset Enclonura.",
      "docPath": "plugins/freyer.md",
      "version": "1.0",
      "updatedAt": "2026-06-11",
      "kind": "plugin",
      "pluginId": "freyer",
      "permissionResources": [
        "teranura",
        "freyer"
      ]
    },
    {
      "slug": "kpi",
      "title": "DA-KPI-Plugin",
      "description": "Panduan KPI staff — poin task, chat SLA, komplain, absen, portal staff, dashboard tim, routing DARA CS, dan pengaturan rules.",
      "docPath": "plugins/kpi.md",
      "version": "1.2",
      "updatedAt": "2026-06-22",
      "kind": "plugin",
      "pluginId": "kpi"
    },
    {
      "slug": "layanan",
      "title": "DA-Layanan-Plugin",
      "description": "Panduan layanan dashboard, paket, voucher, langganan, operasional, kunjungan, invoice — plus handover programmer.",
      "docPath": "plugins/layanan.md",
      "version": "2.3",
      "updatedAt": "2026-07-26",
      "kind": "plugin",
      "pluginId": "layanan",
      "permissionResource": "layanan"
    },
    {
      "slug": "task-manager",
      "title": "DA-Task-Manager-Plugin",
      "description": "Panduan Task Manager daftar & detail tugas, terjadwal/berulang, kategori, integrasi enclosure/proyek.",
      "docPath": "plugins/task-manager.md",
      "version": "1.2",
      "updatedAt": "2026-05-30",
      "kind": "plugin",
      "pluginId": "task-manager",
      "permissionResource": "task-manager"
    },
    {
      "slug": "chat-plugin",
      "title": "Plugin Chat (Inbox & Team Chat)",
      "description": "Indeks kanonikal plugin messaging — inbox AM, Team Chat, label/template, analytics. Bundle v0.2.49+.",
      "docPath": "plugins/chat.md",
      "version": "1.9",
      "updatedAt": "2026-06-27",
      "kind": "plugin",
      "pluginId": "chat",
      "permissionResources": [
        "chat"
      ]
    },
    {
      "slug": "dara-plugin",
      "title": "Plugin DARA (Campaign, Tax & Training)",
      "description": "Indeks kanonikal plugin DARA — SEO, Market Intel, Tax Intelligence, Pelatihan ML. Bundle v0.1.9+.",
      "docPath": "plugins/dara.md",
      "version": "1.5",
      "updatedAt": "2026-07-09",
      "kind": "plugin",
      "pluginId": "dara",
      "permissionResources": [
        "ai-seo",
        "ai-market-intel",
        "tax"
      ]
    },
    {
      "slug": "am-01-ringkasan",
      "title": "Aplikasi AM — Ringkasan & Arsitektur",
      "description": "Apa itu Automation Management (AM), peran vs Kolam, repo, port produksi, dan gambaran arsitektur integrasi.",
      "docPath": "aplikasi-pendukung/am-01-ringkasan.md",
      "version": "1.0",
      "updatedAt": "2026-07-05",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 1,
      "navLabel": "Ringkasan",
      "seriesPageIndex": 1,
      "seriesPageCount": 9,
      "nextSlug": "am-02-infrastruktur"
    },
    {
      "slug": "am-02-infrastruktur",
      "title": "Aplikasi AM — Infrastruktur & Hardware",
      "description": "Rack, box, device, service account, persistent process, Playwright/Xvfb, arsitektur Tokopedia, model data AM.",
      "docPath": "aplikasi-pendukung/am-02-infrastruktur.md",
      "version": "2.1",
      "updatedAt": "2026-06-23",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 2,
      "navLabel": "Infrastruktur",
      "seriesPageIndex": 2,
      "seriesPageCount": 9,
      "prevSlug": "am-01-ringkasan",
      "nextSlug": "am-03-services"
    },
    {
      "slug": "am-03-services",
      "title": "Aplikasi AM — Halaman Services",
      "description": "Panduan lengkap AM-FE /services — start/stop, log, OTP, session Tokopedia, browser view, task history.",
      "docPath": "aplikasi-pendukung/am-03-services.md",
      "version": "2.1",
      "updatedAt": "2026-06-23",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 3,
      "navLabel": "Services",
      "seriesPageIndex": 3,
      "seriesPageCount": 9,
      "prevSlug": "am-02-infrastruktur",
      "nextSlug": "am-04-webhook"
    },
    {
      "slug": "am-04-webhook",
      "title": "Aplikasi AM — Setup Webhook ke Kolam",
      "description": "Konfigurasi webhook AM → kolam-be — URL, secret HMAC, daftar event, test ping, log delivery, produksi.",
      "docPath": "aplikasi-pendukung/am-04-webhook.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 4,
      "navLabel": "Setup webhook",
      "seriesPageIndex": 4,
      "seriesPageCount": 9,
      "prevSlug": "am-03-services",
      "nextSlug": "am-05-tokopedia-order"
    },
    {
      "slug": "am-05-tokopedia-order",
      "title": "Aplikasi AM — Flow Order Tokopedia",
      "description": "Arsitektur produksi Tokopedia — satu browser persistent di tab chat, api-monitor on-demand, order/reverse poll, chat Pigeon, webhook Kolam.",
      "docPath": "aplikasi-pendukung/am-05-tokopedia-order.md",
      "version": "2.3",
      "updatedAt": "2026-06-30",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 5,
      "navLabel": "Order Tokopedia",
      "seriesPageIndex": 5,
      "seriesPageCount": 9,
      "prevSlug": "am-04-webhook",
      "nextSlug": "am-06-task-automasi"
    },
    {
      "slug": "am-06-task-automasi",
      "title": "Aplikasi AM — Task & Automasi",
      "description": "Tipe task AM, task-runner, dispatch Kolam→AM, send_message, stock_sync, update_price, banking transfer.",
      "docPath": "aplikasi-pendukung/am-06-task-automasi.md",
      "version": "1.1",
      "updatedAt": "2026-06-24",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 6,
      "navLabel": "Task & automasi",
      "seriesPageIndex": 6,
      "seriesPageCount": 9,
      "prevSlug": "am-05-tokopedia-order",
      "nextSlug": "am-07-integrasi-kolam"
    },
    {
      "slug": "am-07-integrasi-kolam",
      "title": "Aplikasi AM — Integrasi Kolam",
      "description": "Peta integrasi lengkap Kolam↔AM — env, inbox, marketplace, DARA SEO, platform sync lights, file index.",
      "docPath": "aplikasi-pendukung/am-07-integrasi-kolam.md",
      "version": "1.3",
      "updatedAt": "2026-07-21",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 7,
      "navLabel": "Integrasi Kolam",
      "seriesPageIndex": 7,
      "seriesPageCount": 9,
      "prevSlug": "am-06-task-automasi",
      "nextSlug": "am-08-troubleshooting"
    },
    {
      "slug": "am-08-troubleshooting",
      "title": "Aplikasi AM — Troubleshooting & Handover",
      "description": "Checklist handover programmer, SOP incident, log paths, PM2, align script, FAQ operasional AM+Kolam.",
      "docPath": "aplikasi-pendukung/am-08-troubleshooting.md",
      "version": "2.2",
      "updatedAt": "2026-06-26",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 8,
      "navLabel": "Troubleshooting",
      "seriesPageIndex": 8,
      "seriesPageCount": 9,
      "prevSlug": "am-07-integrasi-kolam",
      "nextSlug": "am-09-remote-dana"
    },
    {
      "slug": "am-09-remote-dana",
      "title": "Aplikasi AM — Remote DANA (Appium + Tailscale)",
      "description": "Prosedur daftar HP DANA di server Appium remote via Tailscale — Rack, Box, Device TCP/USB, port App/Sys/ADB, Service Account, troubleshooting duplikat tcpAddress.",
      "docPath": "aplikasi-pendukung/am-09-remote-dana.md",
      "version": "2.5",
      "updatedAt": "2026-06-24",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log"
      ],
      "seriesId": "am",
      "seriesTitle": "Aplikasi AM",
      "pageOrder": 9,
      "navLabel": "Remote DANA",
      "seriesPageIndex": 9,
      "seriesPageCount": 9,
      "prevSlug": "am-08-troubleshooting"
    },
    {
      "slug": "dara-chat-01-ringkasan",
      "title": "DARA AI (Chat Plugin) — Ringkasan & Arsitektur",
      "description": "Peta arsitektur DARA, repo & layanan, bridge da-ai-service, dan daftar isi seri Chat Plugin.",
      "docPath": "aplikasi-pendukung/dara-chat-01-ringkasan.md",
      "version": "3.0",
      "updatedAt": "2026-06-22",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 1,
      "navLabel": "Ringkasan",
      "seriesPageIndex": 1,
      "seriesPageCount": 11,
      "nextSlug": "dara-chat-02-pengaturan"
    },
    {
      "slug": "dara-chat-02-pengaturan",
      "title": "DARA AI — Settings & AI-Tools",
      "description": "Master switch websetting — Inbox, Business Assistant, SEO, Tax, Market Intel, notifikasi call grup.",
      "docPath": "aplikasi-pendukung/dara-chat-02-pengaturan.md",
      "version": "2.8",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 2,
      "navLabel": "Pengaturan",
      "seriesPageIndex": 2,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-01-ringkasan",
      "nextSlug": "dara-chat-03-team-chat"
    },
    {
      "slug": "dara-chat-03-team-chat",
      "title": "DARA AI — Team Chat & @dara",
      "description": "Routing @dara, Mode SEO konten, tombol mode cepat, peserta room DARA (admin dinamis), call grup.",
      "docPath": "aplikasi-pendukung/dara-chat-03-team-chat.md",
      "version": "3.9",
      "updatedAt": "2026-07-12",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax",
        "dara-training"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 3,
      "navLabel": "Team Chat",
      "seriesPageIndex": 3,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-02-pengaturan",
      "nextSlug": "dara-chat-04-inbox-webstore"
    },
    {
      "slug": "dara-chat-04-inbox-webstore",
      "title": "DARA AI — Inbox & Webstore",
      "description": "Balasan otomatis omnichannel, memori sesi, handler rule-based, chat pembeli webstore, consent fulfillment, pelatihan frasa, balasan foto inbox (3 lapis).",
      "docPath": "aplikasi-pendukung/dara-chat-04-inbox-webstore.md",
      "version": "2.22",
      "updatedAt": "2026-08-05",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 4,
      "navLabel": "Inbox & Webstore",
      "seriesPageIndex": 4,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-03-team-chat",
      "nextSlug": "dara-chat-05-modul-campaign"
    },
    {
      "slug": "dara-chat-05-modul-campaign",
      "title": "DARA AI — Business Assistant & Campaign",
      "description": "Tools @dara, Tax, SEO, Market Intel, peralatan bulk harga, async jobs.",
      "docPath": "aplikasi-pendukung/dara-chat-05-modul-campaign.md",
      "version": "2.10",
      "updatedAt": "2026-08-04",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 5,
      "navLabel": "Modul Campaign",
      "seriesPageIndex": 5,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-04-inbox-webstore",
      "nextSlug": "dara-chat-06-ml-cron-faq"
    },
    {
      "slug": "dara-chat-06-ml-cron-faq",
      "title": "DARA AI — ML, Cron, Vision & FAQ",
      "description": "Cron otomatis, pipeline training ML, vision & CS routing, knowledge SOP, FAQ pengguna.",
      "docPath": "aplikasi-pendukung/dara-chat-06-ml-cron-faq.md",
      "version": "3.3",
      "updatedAt": "2026-08-04",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 6,
      "navLabel": "ML, Cron & FAQ",
      "seriesPageIndex": 6,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-05-modul-campaign",
      "nextSlug": "dara-chat-07-plugin-api"
    },
    {
      "slug": "dara-chat-07-plugin-api",
      "title": "DARA AI — Plugin UI & API",
      "description": "Matriks host vs bundle, deploy plugin, API routes, model MongoDB DARA.",
      "docPath": "aplikasi-pendukung/dara-chat-07-plugin-api.md",
      "version": "3.1",
      "updatedAt": "2026-06-22",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 7,
      "navLabel": "Plugin & API",
      "seriesPageIndex": 7,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-06-ml-cron-faq",
      "nextSlug": "dara-chat-08-ops-handover"
    },
    {
      "slug": "dara-chat-08-ops-handover",
      "title": "DARA AI — Env, RBAC & Handover",
      "description": "Env flags, skrip CLI, RBAC, troubleshooting, checklist programmer & agen AI.",
      "docPath": "aplikasi-pendukung/dara-chat-08-ops-handover.md",
      "version": "2.14",
      "updatedAt": "2026-07-07",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "ai-market-intel",
        "tax"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 8,
      "navLabel": "Ops & Handover",
      "seriesPageIndex": 8,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-07-plugin-api",
      "nextSlug": "dara-chat-09-monitor-kompetitor"
    },
    {
      "slug": "dara-chat-09-monitor-kompetitor",
      "title": "DARA AI — Monitor Kompetitor",
      "description": "Pusat monitor kompetitor — UI campaign, statistik produk, perintah chat DARA (cek data & bulk fetch), kesehatan harga, API.",
      "docPath": "aplikasi-pendukung/dara-chat-09-monitor-kompetitor.md",
      "version": "2.9",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-market-intel"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 9,
      "navLabel": "Monitor Kompetitor",
      "seriesPageIndex": 9,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-08-ops-handover",
      "nextSlug": "dara-chat-10-resolve-rating-analytics"
    },
    {
      "slug": "dara-chat-10-resolve-rating-analytics",
      "title": "DARA AI (Chat Plugin) — Resolve, Rating & Analisa",
      "description": "Alur 3 status inbox, resolve, rating, purge AM 24 jam, assign CS, dan analisa chat.",
      "docPath": "aplikasi-pendukung/dara-chat-10-resolve-rating-analytics.md",
      "version": "2.0",
      "updatedAt": "2026-06-22",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 10,
      "navLabel": "Resolve & Rating",
      "seriesPageIndex": 10,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-09-monitor-kompetitor",
      "nextSlug": "dara-market-intel-platform-fees"
    },
    {
      "slug": "dara-market-intel-platform-fees",
      "title": "DARA AI — Monitor Biaya Platform",
      "description": "Monitor biaya platform Shopee/Tokopedia — profil toko, scan URL kebijakan fee, mapping AI, approve draft, tab kalkulasi komponen.",
      "docPath": "aplikasi-pendukung/dara-market-intel-platform-fees.md",
      "version": "1.1",
      "updatedAt": "2026-06-22",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-market-intel"
      ],
      "seriesId": "dara-chat",
      "seriesTitle": "DARA AI (Chat Plugin)",
      "pageOrder": 11,
      "navLabel": "Monitor Biaya Platform",
      "seriesPageIndex": 11,
      "seriesPageCount": 11,
      "prevSlug": "dara-chat-10-resolve-rating-analytics"
    },
    {
      "slug": "dara-svc-01-ringkasan",
      "title": "DARA AI Service — Ringkasan & Arsitektur",
      "description": "Apa itu da-ai-service, peran vs Kolam BE/FE, Ollama lokal, WebSocket sidecar, dan gambaran arsitektur DARA.",
      "docPath": "aplikasi-pendukung/dara-svc-01-ringkasan.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-svc",
      "seriesTitle": "DARA AI Service",
      "pageOrder": 1,
      "navLabel": "Ringkasan",
      "seriesPageIndex": 1,
      "seriesPageCount": 8,
      "nextSlug": "dara-svc-02-infrastruktur"
    },
    {
      "slug": "dara-svc-02-infrastruktur",
      "title": "DARA AI Service — Infrastruktur & Deploy",
      "description": "Ollama, PM2, install.sh, env vars lengkap, urutan startup, dan perintah ops dari monorepo dara-ai.",
      "docPath": "aplikasi-pendukung/dara-svc-02-infrastruktur.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-svc",
      "seriesTitle": "DARA AI Service",
      "pageOrder": 2,
      "navLabel": "Infrastruktur",
      "seriesPageIndex": 2,
      "seriesPageCount": 8,
      "prevSlug": "dara-svc-01-ringkasan",
      "nextSlug": "dara-svc-03-protokol"
    },
    {
      "slug": "dara-svc-03-protokol",
      "title": "DARA AI Service — Protokol WebSocket",
      "description": "Format request/response WebSocket, auth token, command reset, sentinel, dan error codes.",
      "docPath": "aplikasi-pendukung/dara-svc-03-protokol.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-svc",
      "seriesTitle": "DARA AI Service",
      "pageOrder": 3,
      "navLabel": "Protokol WS",
      "seriesPageIndex": 3,
      "seriesPageCount": 8,
      "prevSlug": "dara-svc-02-infrastruktur",
      "nextSlug": "dara-svc-04-pipeline"
    },
    {
      "slug": "dara-svc-04-pipeline",
      "title": "DARA AI Service — Pipeline AI Engine",
      "description": "Alur ask() — intent, product search, LLM chains, guardrails, sentinel, dan jalur deterministik.",
      "docPath": "aplikasi-pendukung/dara-svc-04-pipeline.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-svc",
      "seriesTitle": "DARA AI Service",
      "pageOrder": 4,
      "navLabel": "Pipeline",
      "seriesPageIndex": 4,
      "seriesPageCount": 8,
      "prevSlug": "dara-svc-03-protokol",
      "nextSlug": "dara-svc-05-memori-model"
    },
    {
      "slug": "dara-svc-05-memori-model",
      "title": "DARA AI Service — Memori Sesi & Model Routing",
      "description": "Kebijakan memori per session_id, evict RAM, tier fast/heavy/fallback, heavy gate di kolam-be.",
      "docPath": "aplikasi-pendukung/dara-svc-05-memori-model.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-svc",
      "seriesTitle": "DARA AI Service",
      "pageOrder": 5,
      "navLabel": "Memori & Model",
      "seriesPageIndex": 5,
      "seriesPageCount": 8,
      "prevSlug": "dara-svc-04-pipeline",
      "nextSlug": "dara-svc-06-integrasi-kolam"
    },
    {
      "slug": "dara-svc-06-integrasi-kolam",
      "title": "DARA AI Service — Integrasi Kolam BE",
      "description": "Peta askAI() di kolam-be, alur inbox/webstore/team chat, reset memori, DARA Training API, dan delivery ke AM.",
      "docPath": "aplikasi-pendukung/dara-svc-06-integrasi-kolam.md",
      "version": "1.1",
      "updatedAt": "2026-06-18",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-svc",
      "seriesTitle": "DARA AI Service",
      "pageOrder": 6,
      "navLabel": "Integrasi Kolam",
      "seriesPageIndex": 6,
      "seriesPageCount": 8,
      "prevSlug": "dara-svc-05-memori-model",
      "nextSlug": "dara-svc-07-plugin-modular"
    },
    {
      "slug": "dara-svc-07-plugin-modular",
      "title": "DARA AI Service — Hubungan Plugin & Modul DARA",
      "description": "Peta hubungan DA-Chat-Plugin, modul DARA di kolam-be, AM, webstore, dan batas tanggung jawab tiap lapisan.",
      "docPath": "aplikasi-pendukung/dara-svc-07-plugin-modular.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-svc",
      "seriesTitle": "DARA AI Service",
      "pageOrder": 7,
      "navLabel": "Plugin & Modul",
      "seriesPageIndex": 7,
      "seriesPageCount": 8,
      "prevSlug": "dara-svc-06-integrasi-kolam",
      "nextSlug": "dara-svc-08-troubleshooting"
    },
    {
      "slug": "dara-svc-08-troubleshooting",
      "title": "DARA AI Service — Troubleshooting & Handover",
      "description": "Gejala umum, health check, log, IP block scraper, Ollama, dan checklist handover programmer.",
      "docPath": "aplikasi-pendukung/dara-svc-08-troubleshooting.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-svc",
      "seriesTitle": "DARA AI Service",
      "pageOrder": 8,
      "navLabel": "Troubleshooting",
      "seriesPageIndex": 8,
      "seriesPageCount": 8,
      "prevSlug": "dara-svc-07-plugin-modular"
    },
    {
      "slug": "dara-cs-01-ringkasan",
      "title": "DARA CS (OpenAI) — Ringkasan & Arsitektur",
      "description": "Apa itu DARA CS OpenAI, perbedaan dengan da-ai-service, channel yang didukung, fulfillment autopilot, dan peta arsitektur kolam-be.",
      "docPath": "aplikasi-pendukung/dara-cs-01-ringkasan.md",
      "version": "1.1",
      "updatedAt": "2026-06-18",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 1,
      "navLabel": "Ringkasan",
      "seriesPageIndex": 1,
      "seriesPageCount": 10,
      "nextSlug": "dara-cs-02-pengaturan"
    },
    {
      "slug": "dara-cs-02-pengaturan",
      "title": "DARA CS — Pengaturan & Environment",
      "description": "Toggle inbox per platform, variabel env kolam-be, sales user, URL publik — untuk admin dan programmer.",
      "docPath": "aplikasi-pendukung/dara-cs-02-pengaturan.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 2,
      "navLabel": "Pengaturan",
      "seriesPageIndex": 2,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-01-ringkasan",
      "nextSlug": "dara-cs-03-channel"
    },
    {
      "slug": "dara-cs-03-channel",
      "title": "DARA CS — Channel & Routing",
      "description": "Perbedaan webstore vs WhatsApp/Instagram/TikTok — apa boleh di chat vs arahkan ke website.",
      "docPath": "aplikasi-pendukung/dara-cs-03-channel.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 3,
      "navLabel": "Channel",
      "seriesPageIndex": 3,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-02-pengaturan",
      "nextSlug": "dara-cs-04-tools-alur"
    },
    {
      "slug": "dara-cs-04-tools-alur",
      "title": "DARA CS — Tools & Alur Bisnis",
      "description": "Daftar 24 tools (23 aktif), alur order customer, shipping quote, fulfillment status, signup OTP, invoice PDF, security banners, eskalasi.",
      "docPath": "aplikasi-pendukung/dara-cs-04-tools-alur.md",
      "version": "1.4",
      "updatedAt": "2026-07-06",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 4,
      "navLabel": "Tools & alur",
      "seriesPageIndex": 4,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-03-channel",
      "nextSlug": "dara-cs-05-mcp-agent-builder"
    },
    {
      "slug": "dara-cs-05-mcp-agent-builder",
      "title": "DARA CS — MCP & Agent Builder",
      "description": "Gateway MCP HTTP, integrasi OpenAI Agent Builder, mode hybrid — dokumentasi programmer.",
      "docPath": "aplikasi-pendukung/dara-cs-05-mcp-agent-builder.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 5,
      "navLabel": "MCP & Agent Builder",
      "seriesPageIndex": 5,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-04-tools-alur",
      "nextSlug": "dara-cs-06-observability"
    },
    {
      "slug": "dara-cs-06-observability",
      "title": "DARA CS — Observability & Metrics",
      "description": "Log run Mongo, endpoint metrics, token usage, eskalasi — monitoring produksi.",
      "docPath": "aplikasi-pendukung/dara-cs-06-observability.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 6,
      "navLabel": "Observability",
      "seriesPageIndex": 6,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-05-mcp-agent-builder",
      "nextSlug": "dara-cs-07-testing"
    },
    {
      "slug": "dara-cs-07-testing",
      "title": "DARA CS — Testing & Go-live",
      "description": "Script smoke/scenario/production-check dan checklist uji manual per channel.",
      "docPath": "aplikasi-pendukung/dara-cs-07-testing.md",
      "version": "1.1",
      "updatedAt": "2026-06-18",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 7,
      "navLabel": "Testing",
      "seriesPageIndex": 7,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-06-observability",
      "nextSlug": "dara-cs-08-troubleshooting"
    },
    {
      "slug": "dara-cs-08-troubleshooting",
      "title": "DARA CS — Troubleshooting",
      "description": "Masalah umum DARA CS — tidak balas, tool error, MCP, channel, invoice — solusi cepat.",
      "docPath": "aplikasi-pendukung/dara-cs-08-troubleshooting.md",
      "version": "1.0",
      "updatedAt": "2026-06-17",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 8,
      "navLabel": "Troubleshooting",
      "seriesPageIndex": 8,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-07-testing",
      "nextSlug": "dara-cs-09-fulfillment-pengiriman"
    },
    {
      "slug": "dara-cs-09-fulfillment-pengiriman",
      "title": "DARA CS — Fulfillment & Pengiriman Autopilot",
      "description": "DARA fulfillment autopilot setelah sale paid, consent kirim, Team Chat SIAP, Biteship consolidated booking, pelatihan frasa, dan tool order_fulfillment_status.",
      "docPath": "aplikasi-pendukung/dara-cs-09-fulfillment-pengiriman.md",
      "version": "1.1",
      "updatedAt": "2026-07-04",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax",
        "sale"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 9,
      "navLabel": "Fulfillment autopilot",
      "seriesPageIndex": 9,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-08-troubleshooting",
      "nextSlug": "dara-cs-10-olshop-dara-ai"
    },
    {
      "slug": "dara-cs-10-olshop-dara-ai",
      "title": "DARA CS — Olshop (Shopee/Tokopedia)",
      "description": "SOP DARA AI di chat Shopee/Tokopedia — anti-ban, attach kartu produk native, spesifikasi custom field, prasyarat env, QA, troubleshooting.",
      "docPath": "aplikasi-pendukung/dara-cs-10-olshop-dara-ai.md",
      "version": "1.6",
      "updatedAt": "2026-08-05",
      "kind": "support",
      "permissionResources": [
        "chat",
        "ai-seo",
        "tax"
      ],
      "seriesId": "dara-cs",
      "seriesTitle": "DARA CS (OpenAI)",
      "pageOrder": 10,
      "navLabel": "Olshop DARA AI",
      "seriesPageIndex": 10,
      "seriesPageCount": 10,
      "prevSlug": "dara-cs-09-fulfillment-pengiriman"
    },
    {
      "slug": "dara-ops-01-operasi-otomatis-ringkasan",
      "title": "DARA Ops — Operasi Otomatis & Transparansi Owner",
      "description": "Ringkasan operasi DARA 24/7 — gated autonomy, audit owner, tanpa mengurangi fitur CS existing.",
      "docPath": "aplikasi-pendukung/dara-ops-01-operasi-otomatis-ringkasan.md",
      "version": "1.1",
      "updatedAt": "2026-07-09",
      "kind": "support",
      "permissionResources": [
        "chat",
        "websetting"
      ],
      "seriesId": "dara-ops",
      "seriesTitle": "DARA Operasi Otomatis",
      "pageOrder": 1,
      "navLabel": "Ringkasan Night Ops",
      "seriesPageIndex": 1,
      "seriesPageCount": 6,
      "nextSlug": "dara-ops-02-notifikasi-staff-wa"
    },
    {
      "slug": "dara-ops-02-notifikasi-staff-wa",
      "title": "DARA Ops — Notifikasi Staff (Team Chat & WhatsApp)",
      "description": "Routing Team Chat General + Penjualan; WA ke CS aktif dan super-admin saat order otomatis jam buka; deep link app.",
      "docPath": "aplikasi-pendukung/dara-ops-02-notifikasi-staff-wa.md",
      "version": "1.2",
      "updatedAt": "2026-07-09",
      "kind": "support",
      "permissionResources": [
        "chat",
        "websetting"
      ],
      "seriesId": "dara-ops",
      "seriesTitle": "DARA Operasi Otomatis",
      "pageOrder": 2,
      "navLabel": "Notifikasi staff",
      "seriesPageIndex": 2,
      "seriesPageCount": 6,
      "prevSlug": "dara-ops-01-operasi-otomatis-ringkasan",
      "nextSlug": "dara-ops-03-olshop-jam-toko"
    },
    {
      "slug": "dara-ops-03-olshop-jam-toko",
      "title": "DARA Ops — Olshop, Jam Toko & Keputusan Otomatis",
      "description": "Rules R9 olshop — inform customer saat libur, defer drop-off, autopilot saat buka, stok Kolam dulu sync AM.",
      "docPath": "aplikasi-pendukung/dara-ops-03-olshop-jam-toko.md",
      "version": "1.1",
      "updatedAt": "2026-07-08",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-ops",
      "seriesTitle": "DARA Operasi Otomatis",
      "pageOrder": 3,
      "navLabel": "Olshop & jam toko",
      "seriesPageIndex": 3,
      "seriesPageCount": 6,
      "prevSlug": "dara-ops-02-notifikasi-staff-wa",
      "nextSlug": "dara-ops-04-audit-digest-owner"
    },
    {
      "slug": "dara-ops-04-audit-digest-owner",
      "title": "DARA Ops — Audit Log & Digest Owner",
      "description": "Audit trail aksi DARA Night Ops — digest pagi WA+FCM ke super-admin, FCM urgent saat gagal.",
      "docPath": "aplikasi-pendukung/dara-ops-04-audit-digest-owner.md",
      "version": "1.0",
      "updatedAt": "2026-07-08",
      "kind": "support",
      "permissionResources": [
        "chat",
        "websetting"
      ],
      "seriesId": "dara-ops",
      "seriesTitle": "DARA Operasi Otomatis",
      "pageOrder": 4,
      "navLabel": "Audit & digest owner",
      "seriesPageIndex": 4,
      "seriesPageCount": 6,
      "prevSlug": "dara-ops-03-olshop-jam-toko",
      "nextSlug": "dara-ops-05-automasi-vs-dara"
    },
    {
      "slug": "dara-ops-05-automasi-vs-dara",
      "title": "DARA Ops — Automasi vs DARA ASLI (staff)",
      "description": "Panduan staff — Mesin A (Automasi/worker) vs Mesin B (DARA LLM chat), indikator Sales, routing paid.",
      "docPath": "aplikasi-pendukung/dara-ops-05-automasi-vs-dara.md",
      "version": "1.3",
      "updatedAt": "2026-07-09",
      "kind": "support",
      "permissionResources": [
        "chat",
        "websetting",
        "sale"
      ],
      "seriesId": "dara-ops",
      "seriesTitle": "DARA Operasi Otomatis",
      "pageOrder": 5,
      "navLabel": "Automasi vs DARA",
      "seriesPageIndex": 5,
      "seriesPageCount": 6,
      "prevSlug": "dara-ops-04-audit-digest-owner",
      "nextSlug": "dara-ops-06-dara-memimpin-penutupan"
    },
    {
      "slug": "dara-ops-06-dara-memimpin-penutupan",
      "title": "DARA Ops — DARA Memimpin (penutupan pengiriman)",
      "description": "Saat DARA pegang sale — delivered LLM multi-channel, SOP hewan, terima kasih, tutup chat reuse; CS serahkan Automasi via perintah LLM.",
      "docPath": "aplikasi-pendukung/dara-ops-06-dara-memimpin-penutupan.md",
      "version": "1.5",
      "updatedAt": "2026-07-09",
      "kind": "support",
      "permissionResources": [
        "chat",
        "websetting",
        "sale"
      ],
      "seriesId": "dara-ops",
      "seriesTitle": "DARA Operasi Otomatis",
      "pageOrder": 6,
      "navLabel": "DARA memimpin",
      "seriesPageIndex": 6,
      "seriesPageCount": 6,
      "prevSlug": "dara-ops-05-automasi-vs-dara"
    },
    {
      "slug": "dara-inventory-copilot-01-dashboard",
      "title": "Inventory Copilot — Dashboard (plugin DARA)",
      "description": "Panel stok, opname, lokasi gudang di Pusat AI — digabung dengan Warehouse Copilot.",
      "docPath": "aplikasi-pendukung/dara-inventory-copilot-01-dashboard.md",
      "version": "1.2",
      "updatedAt": "2026-07-14",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-inventory-copilot",
      "seriesTitle": "Inventory Copilot",
      "pageOrder": 1,
      "navLabel": "Dashboard Inventory Copilot",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-marketplace-copilot-01-dashboard",
      "title": "Marketplace Copilot — dihapus (alih ke Transaksi Copilot)",
      "description": "Tab Marketplace Copilot dicabut — gunakan Transaksi Copilot.",
      "docPath": "aplikasi-pendukung/dara-marketplace-copilot-01-dashboard.md",
      "version": "2.0",
      "updatedAt": "2026-07-10",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-marketplace-copilot",
      "seriesTitle": "Marketplace Copilot",
      "pageOrder": 1,
      "navLabel": "Marketplace Copilot (dihapus)",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-owner-copilot-01-dashboard",
      "title": "Owner Copilot — Dashboard (plugin DARA)",
      "description": "Panel snapshot bisnis + Night Ops di Pusat AI — read-only.",
      "docPath": "aplikasi-pendukung/dara-owner-copilot-01-dashboard.md",
      "version": "1.1",
      "updatedAt": "2026-07-09",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-owner-copilot",
      "seriesTitle": "Owner Copilot",
      "pageOrder": 1,
      "navLabel": "Dashboard Owner Copilot",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-training-vision",
      "title": "Pelatihan DARA — Vision inbox",
      "description": "Operasional vision inbox — closed-world, indeks species+produk, YOLO, hard negative, bukti bayar.",
      "docPath": "aplikasi-pendukung/dara-training-vision.md",
      "version": "2.0",
      "updatedAt": "2026-06-29",
      "kind": "support",
      "seriesId": "dara-plugin",
      "pageOrder": 2,
      "navLabel": "Vision inbox",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "pembaruan-01-ringkasan-2026-06-20",
      "title": "Pembaruan Juni 2026 — Ringkasan",
      "description": "Ringkasan perubahan plugin Layanan, Enclosure, Task Manager, dan webstore (20 Juni 2026).",
      "docPath": "aplikasi-pendukung/pembaruan-01-ringkasan-2026-06-20.md",
      "version": "1.0",
      "updatedAt": "2026-06-20",
      "kind": "support",
      "permissionResources": [
        "layanan",
        "enclosure",
        "task-manager",
        "sale"
      ],
      "seriesId": "pembaruan-juni-2026",
      "seriesTitle": "Pembaruan Juni 2026",
      "pageOrder": 1,
      "navLabel": "Ringkasan",
      "seriesPageIndex": 1,
      "seriesPageCount": 4,
      "nextSlug": "pembaruan-02-layanan-logic-2026-06-20"
    },
    {
      "slug": "pembaruan-02-layanan-logic-2026-06-20",
      "title": "Pembaruan — Layanan (logic & operasional)",
      "description": "Perubahan logic plugin Layanan Juni 2026 — tipe task, voucher, langganan, komisi, material, jadwal.",
      "docPath": "aplikasi-pendukung/pembaruan-02-layanan-logic-2026-06-20.md",
      "version": "1.0",
      "updatedAt": "2026-07-03",
      "kind": "support",
      "permissionResources": [
        "layanan",
        "sale",
        "commission"
      ],
      "seriesId": "pembaruan-juni-2026",
      "seriesTitle": "Pembaruan Juni 2026",
      "pageOrder": 2,
      "navLabel": "Layanan (logic)",
      "seriesPageIndex": 2,
      "seriesPageCount": 4,
      "prevSlug": "pembaruan-01-ringkasan-2026-06-20",
      "nextSlug": "pembaruan-03-enclosure-task-webstore-2026-06-20"
    },
    {
      "slug": "pembaruan-03-enclosure-task-webstore-2026-06-20",
      "title": "Pembaruan — Enclosure, Task, Webstore",
      "description": "Enclosure plugin webstore SDK, Task Manager tipe task, fitur webstore terkait Juni 2026.",
      "docPath": "aplikasi-pendukung/pembaruan-03-enclosure-task-webstore-2026-06-20.md",
      "version": "1.0",
      "updatedAt": "2026-06-20",
      "kind": "support",
      "permissionResources": [
        "layanan",
        "enclosure",
        "task-manager",
        "sale"
      ],
      "seriesId": "pembaruan-juni-2026",
      "seriesTitle": "Pembaruan Juni 2026",
      "pageOrder": 3,
      "navLabel": "Enclosure & webstore",
      "seriesPageIndex": 3,
      "seriesPageCount": 4,
      "prevSlug": "pembaruan-02-layanan-logic-2026-06-20",
      "nextSlug": "pembaruan-04-tokopedia-request-pickup-2026-06-24"
    },
    {
      "slug": "pembaruan-04-tokopedia-request-pickup-2026-06-24",
      "title": "Pembaruan — Request Pickup Tokopedia (Jun 2026)",
      "description": "Fix request pickup Tokopedia — endpoint Seller Center verified, alur staff di Sales, task AM, script sniff/deploy/handover programmer.",
      "docPath": "aplikasi-pendukung/pembaruan-04-tokopedia-request-pickup-2026-06-24.md",
      "version": "1.0",
      "updatedAt": "2026-06-24",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat",
        "sale",
        "activity-log",
        "shipping_method"
      ],
      "seriesId": "pembaruan-juni-2026",
      "seriesTitle": "Pembaruan Juni 2026",
      "pageOrder": 4,
      "navLabel": "Pickup Tokopedia",
      "seriesPageIndex": 4,
      "seriesPageCount": 4,
      "prevSlug": "pembaruan-03-enclosure-task-webstore-2026-06-20"
    },
    {
      "slug": "bantuan-plugin-mandiri",
      "title": "Plugin Bantuan Mandiri",
      "description": "Migrasi /bantuan ke DA-Bantuan-Plugin — UI + konten static tanpa restart FE.",
      "docPath": "modul/bantuan-plugin-mandiri.md",
      "version": "1.0",
      "updatedAt": "2026-06-23",
      "kind": "support",
      "seriesId": "platform-plugin",
      "seriesTitle": "Platform Plugin",
      "pageOrder": 3,
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-po-copilot-01-dashboard",
      "title": "PO Copilot — Dashboard (plugin DARA)",
      "description": "Panel PO closed vs gagal, profil Raja Anemon, log operasi di Pusat AI.",
      "docPath": "aplikasi-pendukung/dara-po-copilot-01-dashboard.md",
      "version": "1.0",
      "updatedAt": "2026-07-10",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-po-copilot",
      "seriesTitle": "PO Copilot",
      "pageOrder": 1,
      "navLabel": "Dashboard PO Copilot",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-procurement-copilot-01-dashboard",
      "title": "Procurement Copilot — dihapus (alih ke PO Copilot)",
      "description": "Tab Procurement Copilot dicabut — gunakan PO Copilot.",
      "docPath": "aplikasi-pendukung/dara-procurement-copilot-01-dashboard.md",
      "version": "2.0",
      "updatedAt": "2026-07-10",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-procurement-copilot",
      "seriesTitle": "Procurement Copilot",
      "pageOrder": 1,
      "navLabel": "Procurement Copilot (dihapus)",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-receiving-copilot-01-dashboard",
      "title": "Receiving Copilot — dihapus (alih ke PO Copilot)",
      "description": "Tab Receiving Copilot dicabut — gunakan PO Copilot.",
      "docPath": "aplikasi-pendukung/dara-receiving-copilot-01-dashboard.md",
      "version": "2.0",
      "updatedAt": "2026-07-10",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-receiving-copilot",
      "seriesTitle": "Receiving Copilot",
      "pageOrder": 1,
      "navLabel": "Receiving Copilot (dihapus)",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-supplier-copilot-01-dashboard",
      "title": "Supplier Copilot — dihapus (alih ke PO Copilot)",
      "description": "Tab Supplier Copilot dicabut — gunakan PO Copilot.",
      "docPath": "aplikasi-pendukung/dara-supplier-copilot-01-dashboard.md",
      "version": "2.0",
      "updatedAt": "2026-07-10",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-supplier-copilot",
      "seriesTitle": "Supplier Copilot",
      "pageOrder": 1,
      "navLabel": "Supplier Copilot (dihapus)",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-shipping-copilot-01-dashboard",
      "title": "Transaksi Copilot — Dashboard (plugin DARA)",
      "description": "Panel Delivery DARA vs Katak Terbang di Pusat AI — order per kanal + log operasi.",
      "docPath": "aplikasi-pendukung/dara-shipping-copilot-01-dashboard.md",
      "version": "2.0",
      "updatedAt": "2026-07-09",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-shipping-copilot",
      "seriesTitle": "Shipping Copilot",
      "pageOrder": 1,
      "navLabel": "Dashboard Transaksi Copilot",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "dara-warehouse-copilot-01-dashboard",
      "title": "Warehouse Copilot — digabung ke Inventory (deprecated)",
      "description": "Warehouse Copilot digabung ke Inventory Copilot — jangan pakai tab terpisah.",
      "docPath": "aplikasi-pendukung/dara-warehouse-copilot-01-dashboard.md",
      "version": "1.2",
      "updatedAt": "2026-07-14",
      "kind": "support",
      "permissionResources": [
        "chat"
      ],
      "seriesId": "dara-warehouse-copilot",
      "seriesTitle": "Warehouse Copilot",
      "pageOrder": 1,
      "navLabel": "Digabung ke Inventory",
      "seriesPageIndex": 1,
      "seriesPageCount": 1
    },
    {
      "slug": "webstore-01-ringkasan",
      "title": "Webstore — Ringkasan",
      "description": "Arsitektur webstore Dunia Anura (da-marketplace), URL, locale, deploy PM2, dan indeks seri dokumentasi.",
      "docPath": "aplikasi-pendukung/webstore-01-ringkasan.md",
      "version": "1.1",
      "updatedAt": "2026-07-15",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "product",
        "species"
      ],
      "seriesId": "webstore",
      "seriesTitle": "Webstore (da-marketplace)",
      "pageOrder": 1,
      "navLabel": "Ringkasan",
      "seriesPageIndex": 1,
      "seriesPageCount": 6,
      "nextSlug": "webstore-02-google-maps-alamat"
    },
    {
      "slug": "webstore-02-google-maps-alamat",
      "title": "Webstore — Google Maps & Alamat",
      "description": "Dua Google API key (server IP + browser referer), env .env.production/.env.local, wizard alamat checkout, troubleshooting autocomplete.",
      "docPath": "aplikasi-pendukung/webstore-02-google-maps-alamat.md",
      "version": "1.0",
      "updatedAt": "2026-07-03",
      "kind": "support",
      "permissionResources": [
        "websetting"
      ],
      "seriesId": "webstore",
      "seriesTitle": "Webstore (da-marketplace)",
      "pageOrder": 2,
      "navLabel": "Google Maps",
      "seriesPageIndex": 2,
      "seriesPageCount": 6,
      "prevSlug": "webstore-01-ringkasan",
      "nextSlug": "webstore-google-auth"
    },
    {
      "slug": "webstore-google-auth",
      "title": "Webstore — Google Sign-In",
      "description": "Aktifkan daftar/masuk webstore dengan akun Google — toggle Kolam, OAuth Client ID, keamanan public slice, audit, troubleshooting.",
      "docPath": "aplikasi-pendukung/webstore-google-auth.md",
      "version": "1.1",
      "updatedAt": "2026-07-03",
      "kind": "support",
      "permissionResources": [
        "websetting"
      ],
      "seriesId": "webstore",
      "seriesTitle": "Webstore (da-marketplace)",
      "pageOrder": 3,
      "navLabel": "Google Sign-In",
      "seriesPageIndex": 3,
      "seriesPageCount": 6,
      "prevSlug": "webstore-02-google-maps-alamat",
      "nextSlug": "webstore-04-checkout-pembayaran"
    },
    {
      "slug": "webstore-04-checkout-pembayaran",
      "title": "Webstore — Checkout & Pembayaran",
      "description": "Alur checkout webstore — alamat, ongkir gabung per order, voucher, persetujuan TOS, metode bayar, halaman thanks & DANA QR.",
      "docPath": "aplikasi-pendukung/webstore-04-checkout-pembayaran.md",
      "version": "1.1",
      "updatedAt": "2026-07-04",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "sale",
        "payment_method",
        "shipping_method"
      ],
      "seriesId": "webstore",
      "seriesTitle": "Webstore (da-marketplace)",
      "pageOrder": 4,
      "navLabel": "Checkout",
      "seriesPageIndex": 4,
      "seriesPageCount": 6,
      "prevSlug": "webstore-google-auth",
      "nextSlug": "webstore-05-katalog-locale"
    },
    {
      "slug": "webstore-05-katalog-locale",
      "title": "Webstore — Katalog & Locale",
      "description": "Halaman katalog webstore, 7 locale, terjemahan CMS, custom field, halaman spesies/produk, SEO.",
      "docPath": "aplikasi-pendukung/webstore-05-katalog-locale.md",
      "version": "1.1",
      "updatedAt": "2026-08-05",
      "kind": "support",
      "permissionResources": [
        "product",
        "species",
        "category",
        "tag",
        "custom-field"
      ],
      "seriesId": "webstore",
      "seriesTitle": "Webstore (da-marketplace)",
      "pageOrder": 5,
      "navLabel": "Katalog & i18n",
      "seriesPageIndex": 5,
      "seriesPageCount": 6,
      "prevSlug": "webstore-04-checkout-pembayaran",
      "nextSlug": "webstore-06-chat-dashboard-plugin"
    },
    {
      "slug": "webstore-06-chat-dashboard-plugin",
      "title": "Webstore — Chat, Dashboard & Plugin",
      "description": "Chat tamu webstore, dashboard customer, plugin enclosure/layanan/freyr, env GUEST_CHAT_SECRET, deploy bundle.",
      "docPath": "aplikasi-pendukung/webstore-06-chat-dashboard-plugin.md",
      "version": "1.0",
      "updatedAt": "2026-07-03",
      "kind": "support",
      "permissionResources": [
        "websetting",
        "chat"
      ],
      "seriesId": "webstore",
      "seriesTitle": "Webstore (da-marketplace)",
      "pageOrder": 6,
      "navLabel": "Chat & plugin",
      "seriesPageIndex": 6,
      "seriesPageCount": 6,
      "prevSlug": "webstore-05-katalog-locale"
    },
    {
      "slug": "pos",
      "title": "Aplikasi POS (Point of Sale)",
      "description": "Panduan aplikasi POS kasir — shift, checkout, penjualan, cashflow, auth, CSRF, deploy, troubleshooting, dan handover programmer.",
      "docPath": "aplikasi/pos.md",
      "version": "1.1",
      "updatedAt": "2026-07-05",
      "kind": "app",
      "permissionResources": [
        "sale",
        "customer",
        "chat",
        "wallet"
      ]
    },
    {
      "slug": "staff-desktop-gate",
      "title": "Pembatasan Browser Staff & MAC Desktop",
      "description": "Panduan redirect browser kolam/pos/frogs ke webstore, login darurat, pembatasan MAC Kolam Desktop — pengguna admin dan handover programmer (nginx + kolam-be).",
      "docPath": "keamanan/staff-desktop-gate.md",
      "version": "1.0",
      "updatedAt": "2026-07-05",
      "kind": "security",
      "permissionResources": [
        "websetting",
        "role",
        "activity-log"
      ]
    },
    {
      "slug": "security-audit",
      "title": "Security Audit",
      "description": "Laporan audit keamanan kolam-be + Kolam FE — temuan, patch 30 Mei 2026, status perbaikan.",
      "docPath": "keamanan/security-audit.md",
      "version": "1.9",
      "updatedAt": "2026-07-05",
      "kind": "security",
      "permissionResources": [
        "websetting",
        "role",
        "activity-log"
      ]
    }
  ]
} satisfies KolamBantuanManifest;
