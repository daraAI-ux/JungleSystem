import type { AccessScope } from './auth';
import type { AppModule } from './app-shell';
import { canonicalizeKolamShippingMethodRoute } from './kolam-shipping-method';

export interface KolamNavigationItem {
  label: string;
  route: string;
  description: string;
  group?: string;
  moduleIcon?: KolamNavigationModuleIcon;
  requiredAccess: Array<keyof AccessScope>;
}

export type KolamNavigationModuleIcon =
  | 'archive'
  | 'brand'
  | 'cashflowSession'
  | 'category'
  | 'download'
  | 'enclosure'
  | 'fieldcustom'
  | 'iucn'
  | 'location'
  | 'media'
  | 'packing'
  | 'product'
  | 'production'
  | 'purchaseOrder'
  | 'raw'
  | 'sales'
  | 'salesSource'
  | 'serial'
  | 'species'
  | 'stockMovement'
  | 'stockOpname'
  | 'supplier'
  | 'tag'
  | 'taskManager'
  | 'taxonomy'
  | 'teranura'
  | 'unit';

export interface KolamNavigationSection {
  id: string;
  title: string;
  items: KolamNavigationItem[];
}

export interface KolamNavigationDisclosure {
  visibleItems: KolamNavigationItem[];
  hiddenCount: number;
  countLabel: string;
}

export interface KolamNavigationRouteTarget {
  moduleId: AppModule;
  searchHint: string;
  message: string;
}

export interface KolamNavigationRouteVariant extends KolamNavigationItem {
  baseRoute: string;
  routePattern: string;
}

export type KolamNavigationRouteSurfaceKind =
  | 'live-menu'
  | 'live-route-variant'
  | 'runtime-context';

export interface KolamNavigationRouteSurfaceContract {
  baseRoute: string;
  coverageEvidence: 'npm run verify:live-routes';
  routeKind: KolamNavigationRouteSurfaceKind;
  routePattern: string;
  runtimeRoute: string;
  sourcePath: string;
  sourceRepo: string;
}

export type KolamNavigationChromeIconKind =
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up';

export interface KolamNavigationChromeAction {
  id: 'move-up' | 'move-down';
  label: string;
  iconKind: Exclude<KolamNavigationChromeIconKind, 'chevron-right'>;
}

export interface KolamNavigationChromeContract {
  disclosureCollapsedIconKind: 'chevron-right';
  disclosureExpandedIconKind: 'chevron-down';
  activeState: {
    background: 'primary/10';
    resolvedBackground: '#e8f6ed';
    foreground: 'primary';
    iconFill: 'primary/20';
  };
  reorderActions: KolamNavigationChromeAction[];
  sourceComponent: string;
}

export const kolamNavigationSections: KolamNavigationSection[] = [
  {
    id: 'overview',
    title: 'Beranda',
    items: [
      {
        label: 'Beranda',
        route: '/',
        description: 'Ringkasan penjualan, stok, dan performa bisnis',
        requiredAccess: ['kolam', 'pos', 'am'],
      },
      {
        label: 'Kotak Masuk',
        route: '/inbox',
        description: 'Kotak masuk chat terpadu - Tokopedia, Shopee, Store',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Chat Tim',
        route: '/team-chat',
        description: 'Ruang chat tim internal dari Kolam live',
        group: 'Komunikasi',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Notifikasi',
        route: '/notifications',
        description: 'Pusat notifikasi dan tindak lanjut aktivitas',
        group: 'Komunikasi',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Pusat AI',
        route: '/pusat-ai',
        description: 'Pintu masuk asisten AI dan otomasi dari Kolam live',
        group: 'Komunikasi',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Bantuan',
        route: '/bantuan',
        description: 'Pusat bantuan dan dokumentasi operasional',
        group: 'Dukungan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Download Aplikasi',
        route: '/app-downloads',
        description: 'Unduh aplikasi pendukung desktop, mobile, dan installer.',
        group: 'Dukungan',
        moduleIcon: 'download',
        requiredAccess: ['kolam'],
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventori',
    items: [
      {
        label: 'Merek',
        route: '/brands',
        description: 'Kelola merek produk',
        moduleIcon: 'brand',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Kategori',
        route: '/label-dan-field/kategori',
        description:
          'Kelola kategori produk dan spesies dari Label dan Field Kolam',
        group: 'Label dan Field',
        moduleIcon: 'category',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Tag',
        route: '/tags',
        description: 'Kelola tag untuk produk, layanan, dan species',
        group: 'Label dan Field',
        moduleIcon: 'tag',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Field Kustom',
        route: '/custom-fields',
        description: 'Kelola field tambahan untuk data produk dan katalog.',
        group: 'Label dan Field',
        moduleIcon: 'fieldcustom',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Custom Field Profiles',
        route: '/custom-field-profiles',
        description: 'Reusable custom field profile sets from live Kolam',
        group: 'Label dan Field',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Satuan',
        route: '/units',
        description: 'Kelola satuan pengukuran untuk produk dan spesies.',
        group: 'Label dan Field',
        moduleIcon: 'unit',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Produk',
        route: '/products',
        description: 'Daftar produk yang dijual',
        group: 'Produk',
        moduleIcon: 'product',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Bahan Baku',
        route: '/raw-materials',
        description: 'Bahan baku untuk produksi',
        group: 'Produk',
        moduleIcon: 'raw',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Spesies',
        route: '/species',
        description:
          'Kelola data spesies untuk livestock, POS, dan marketplace',
        group: 'Stok Hidup',
        moduleIcon: 'species',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Taksonomi',
        route: '/taxonomy',
        description: 'Klasifikasi dan hierarki taksonomi',
        group: 'Stok Hidup',
        moduleIcon: 'taxonomy',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Status IUCN',
        route: '/iucn-status',
        description: 'Badge status konservasi',
        group: 'Stok Hidup',
        moduleIcon: 'iucn',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Layanan',
        route: '/service',
        description: 'Layanan yang ditawarkan',
        group: 'Layanan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Layanan',
        route: '/layanan',
        description:
          'Ringkasan operasional, katalog paket, dan langganan pelanggan.',
        group: 'Layanan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Layanan Tertunda',
        route: '/kontrol-layanan/pending-services',
        description: 'Daftar voucher layanan, belum digunakan dan aktif',
        group: 'Layanan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Tugas Aktif',
        route: '/kontrol-layanan/active-tasks',
        description:
          'Tugas dosing dan maintenance yang berjalan atau akan datang',
        group: 'Layanan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Transaksi Stok',
        route: '/stock-transaction',
        description: 'Pergerakan ledger dan opname satu item',
        group: 'Stok',
        moduleIcon: 'stockMovement',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Stock Opname',
        route: '/stock-opname',
        description:
          'Penghitungan fisik multi-baris dengan alur review dan posting',
        group: 'Stok',
        moduleIcon: 'stockOpname',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Lokasi',
        route: '/locations',
        description: 'Kelola lokasi gudang, lantai, rak, dan area penyimpanan',
        group: 'Inventory',
        moduleIcon: 'location',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Assets',
        route: '/assets',
        description: 'Asset inventory tracked in the live Kolam app',
        group: 'Stok',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Bahan Kemasan',
        route: '/packing-materials',
        description:
          'Master data bahan kemasan untuk pengemasan dan pengiriman',
        group: 'Stok',
        moduleIcon: 'packing',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Media',
        route: '/media',
        description: 'Browse all images and videos in the media folder',
        moduleIcon: 'media',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Pemasok',
        route: '/suppliers',
        description: 'Daftar pemasok dan vendor pengadaan',
        group: 'Pengadaan',
        moduleIcon: 'supplier',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Purchase Order',
        route: '/purchase-order',
        description: 'Create and manage purchase orders',
        group: 'Pengadaan',
        moduleIcon: 'purchaseOrder',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Produksi',
        route: '/production',
        description: 'Kelola proses produksi dan manufaktur',
        group: 'Produksi',
        moduleIcon: 'production',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Serial Produk',
        route: '/product-serials',
        description: 'Nomor seri dan lisensi per unit hasil produksi',
        group: 'Produksi',
        moduleIcon: 'serial',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Kandang',
        route: '/enclosures',
        description: 'Data kandang dan habitat dari live Kolam',
        group: 'Stok Hidup',
        moduleIcon: 'enclosure',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Teranura',
        route: '/teranura',
        description: 'Teranura animal records and statistics workspace',
        group: 'Stok Hidup',
        moduleIcon: 'teranura',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Freyer',
        route: '/freyer',
        description: 'Freyer breeding and hardware-linked records',
        group: 'Stok Hidup',
        requiredAccess: ['kolam'],
      },
      {
        label: 'IoT Freyer',
        route: '/iot-freyer',
        description: 'IoT Freyer monitoring route from live Kolam',
        group: 'Stok Hidup',
        requiredAccess: ['kolam'],
      },
    ],
  },
  {
    id: 'sales',
    title: 'Penjualan & Arus Kas',
    items: [
      {
        label: 'Penjualan',
        route: '/sales',
        description:
          'Kelola invoice penjualan dan status pembayaran serta pengiriman.',
        group: 'Penjualan',
        moduleIcon: 'sales',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Sumber Penjualan',
        route: '/source',
        description:
          'Kelola sumber penjualan (Shopee, Tokopedia, toko offline, dll.) dengan field biaya dinamis untuk perhitungan profit.',
        group: 'Penjualan',
        moduleIcon: 'salesSource',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Sesi Tunai',
        route: '/cashflow-session',
        description: 'Sesi kas harian dan rekonsiliasi',
        group: 'Penjualan',
        moduleIcon: 'cashflowSession',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Shift Kasir POS',
        route: '/pos/cashflow',
        description: 'Buka dan tutup shift kasir POS',
        group: 'Penjualan',
        requiredAccess: ['pos'],
      },
      {
        label: 'Komplain',
        route: '/complaints',
        description: 'Kelola semua tiket komplain dan penyelesaiannya.',
        group: 'Penjualan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Daftar',
        route: '/campaign',
        description: 'Kelola semua kampanye pemasaran dan promosi.',
        group: 'Kampanye',
        requiredAccess: ['kolam'],
      },
      {
        label: 'DARA Jobs',
        route: '/pusat-ai',
        description: 'DARA campaign job queue from live Kolam',
        group: 'Kampanye',
        requiredAccess: ['kolam'],
      },
      {
        label: 'DARA Marketing',
        route: '/campaign/dara-marketing',
        description: 'Marketing automation surface from live Kolam',
        group: 'Kampanye',
        requiredAccess: ['kolam'],
      },
      {
        label: 'DARA AI Market Intelligence',
        route: '/campaign/dara-market-intel',
        description:
          'Monitor harga & supplier, rekomendasi pricing/pembelian. Semua saran butuh approval — terapkan harga manual di produk setelah disetujui.',
        group: 'Kampanye',
        requiredAccess: ['kolam'],
      },
      {
        label: 'DARA SEO & Market Intelligence',
        route: '/campaign/dara-seo',
        description:
          'Analisa, rekomendasi, dan draft perubahan. Mutasi produk hanya setelah approval.',
        group: 'Kampanye',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Discount Approval',
        route: '/sales/discount-approval',
        description: 'Discount request approvals',
        group: 'Kampanye',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Vouchers',
        route: '/vouchers',
        description: 'Discount codes for marketplace customers',
        group: 'Kampanye',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Metode Pengiriman',
        route: '/metode-pengiriman',
        description:
          'Kelola opsi pengiriman internal dan layanan Biteship untuk checkout',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Surat Penawaran Baru',
        route: '/proyek/new',
        description: 'Detil proyek & surat penawaran',
        group: 'Proyek',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Syarat & Ketentuan',
        route: '/terms-templates',
        description: 'Template syarat dan ketentuan untuk surat penawaran',
        group: 'Penjualan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Proyek',
        route: '/proyek',
        description: 'Detil proyek & surat penawaran',
        group: 'Penjualan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Appointments',
        route: '/appointments',
        description: 'Appointment scheduling and edit workflow',
        group: 'Operations',
        requiredAccess: ['kolam'],
      },
    ],
  },
  {
    id: 'finance',
    title: 'Keuangan',
    items: [
      {
        label: 'Ringkasan Keuangan',
        route: '/finance',
        description: 'Ringkasan keuangan dan laporan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Bonus',
        route: '/finance/bonus',
        description: 'Bonus gaji karyawan untuk penggajian',
        group: 'Payroll & Tax',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Penggajian',
        route: '/finance/payroll',
        description: 'Slip gaji bulanan, PPh 21, dan gaji bersih',
        group: 'Payroll & Tax',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Tax Profile',
        route: '/finance/settings/tax-profile',
        description: 'Pengaturan profil pajak untuk keuangan dan penggajian',
        group: 'Payroll & Tax',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Pajak Keuangan',
        route: '/finance/tax',
        description:
          'Estimasi compliance per periode. Bukan pelaporan otomatis ke DJP.',
        group: 'Payroll & Tax',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Wallet',
        route: '/wallet',
        description: 'Kelola dompet dan saldo kas',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Pembelian Aset',
        route: '/asset-purchase',
        description: 'Pembelian aset tetap',
        group: 'Pengeluaran & Pemasukan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Commission',
        route: '/commissions',
        description: 'Akrual dan pelepasan komisi penjualan',
        group: 'Pengeluaran & Pemasukan',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Payable',
        route: '/payable',
        description:
          'Kewajiban pembayaran (akrual) — PO belum lunas, pinjaman, utang mendatang',
        group: 'Pengeluaran & Pemasukan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Receivables',
        route: '/receivable',
        description: 'Piutang usaha dan invoice yang belum dibayar customer',
        group: 'Pengeluaran & Pemasukan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Pengeluaran Rutin',
        route: '/routine-expenses',
        description: 'Pengeluaran rutin bulanan',
        group: 'Pengeluaran & Pemasukan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Pengeluaran Tak Terduga',
        route: '/unexpected-expense',
        description: 'Pengeluaran tak terduga',
        group: 'Pengeluaran & Pemasukan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Pemasukan Tak Terduga',
        route: '/unexpected-income',
        description: 'Pemasukan tak terduga',
        group: 'Pengeluaran & Pemasukan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Payment Method',
        route: '/payment-methods',
        description: 'Metode pembayaran yang diterima',
        group: 'Pengaturan Keuangan',
        requiredAccess: ['kolam'],
      },
    ],
  },
  {
    id: 'user',
    title: 'Pengguna',
    items: [
      {
        label: 'Pelanggan',
        route: '/customers',
        description: 'Data pelanggan dan riwayat transaksi',
        group: 'Pelanggan',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Spesies Pelanggan',
        route: '/customer-species',
        description: "User's personal species collections",
        group: 'Pelanggan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Manajemen Titipan Pelanggan',
        route: '/customer-storage',
        description: 'Manajemen barang titipan pelanggan',
        group: 'Pelanggan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Log Titipan Pelanggan',
        route: '/customer-storage-logs',
        description: 'Log aktivitas titipan pelanggan',
        group: 'Pelanggan',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Manajemen Pengguna',
        route: '/list-of-users',
        description:
          'Kelola semua pengguna sistem, termasuk data pribadi, peran, dan status akun.',
        requiredAccess: ['kolam'],
      },
      {
        label: 'HR',
        route: '/list-of-users/hr',
        description: 'HR profile and employment data from live Kolam',
        group: 'Staff',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Overtime',
        route: '/list-of-users/overtime',
        description: 'Staff overtime records and approvals',
        group: 'Staff',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Staff Attendance',
        route: '/staff-attendance',
        description: 'Attendance overview and staff presence records',
        group: 'Staff Attendance',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Staff Leaves',
        route: '/staff-attendance/leaves',
        description: 'Leave requests and attendance exceptions',
        group: 'Staff Attendance',
        requiredAccess: ['kolam'],
      },
      {
        label: 'My Attendance',
        route: '/staff-attendance/me',
        description: 'Signed-in staff attendance self-service route',
        group: 'Staff Attendance',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Portal',
        route: '/portal',
        description: 'Staff portal, KPI, and slip access routes',
        group: 'Staff',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Manajemen Tugas',
        route: '/task-manager',
        description: 'Kelola tugas, tugas terjadwal, dan pengaturan tugas',
        group: 'Staff',
        moduleIcon: 'taskManager',
        requiredAccess: ['kolam'],
      },
    ],
  },
  {
    id: 'enclonura',
    title: 'Enclonura',
    items: [
      {
        label: 'Enclonura Species',
        route: '/enclonura-species',
        description: 'Encyclopedia species from Enclonura',
        group: 'Enclonura Management',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Request Species',
        route: '/species-request',
        description: 'Request species for Enclonura; uses Kolam taxonomy',
        group: 'Enclonura Management',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Taxonomy Request',
        route: '/taxonomy-request',
        description: 'Pending taxonomy approval requests',
        group: 'Enclonura Management',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Storage Management',
        route: '/storage-management',
        description: 'Storage items, my storage, and pending requests',
        group: 'Enclonura Storage',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Storage Logs',
        route: '/storage-history',
        description: 'History of storage additions and deductions',
        group: 'Enclonura Storage',
        requiredAccess: ['kolam'],
      },
    ],
  },
];

const sidebarFallbackDescriptions: Record<string, string> = {
  '/label-dan-field/merek': 'Kelola merek produk dari Label dan Field Kolam',
  '/label-dan-field/kategori':
    'Kelola kategori produk dan spesies dari Label dan Field Kolam',
  '/products/archive': 'Arsip produk (riwayat baca saja)',
  '/list-of-users/dara-training':
    'Kamus respons cepat, consent pengiriman, koreksi ranking produk, dan vision inbox (species + produk + bukti bayar).',
  '/list-of-users/kpi': 'Dashboard kinerja tim (admin)',
  '/task-manager/settings/categories': 'Kategori dinamis (admin)',
  '/task-manager/settings/task-types':
    'Katalog tipe tugas dinamis (dosing, maintenance, kustom)',
};

export const kolamSidebarNavigationSections: KolamNavigationSection[] = [
  {
    id: 'inventory',
    title: 'Inventori',
    items: [
      sidebarItem('/label-dan-field/merek', {
        group: 'Label dan Field',
        label: 'Merek',
        moduleIcon: 'brand',
      }),
      sidebarItem('/label-dan-field/kategori', {
        group: 'Label dan Field',
        label: 'Kategori',
      }),
      sidebarItem('/tags', { group: 'Label dan Field', label: 'Tag' }),
      sidebarItem('/custom-fields', {
        group: 'Label dan Field',
        label: 'Field Kustom',
        moduleIcon: 'fieldcustom',
      }),
      sidebarItem('/units', {
        group: 'Label dan Field',
        label: 'Satuan',
        moduleIcon: 'unit',
      }),
      sidebarItem('/species', {
        group: 'Stok Hidup',
        label: 'Spesies',
        moduleIcon: 'species',
      }),
      sidebarItem('/taxonomy', {
        group: 'Stok Hidup',
        label: 'Taksonomi',
        moduleIcon: 'taxonomy',
      }),
      sidebarItem('/iucn-status', {
        group: 'Stok Hidup',
        label: 'Status IUCN',
        moduleIcon: 'iucn',
      }),
      sidebarItem('/products', {
        group: 'Produk',
        label: 'Daftar Produk',
        moduleIcon: 'product',
      }),
      sidebarItem('/products/archive', {
        group: 'Produk',
        label: 'Arsip Produk',
        moduleIcon: 'product',
      }),
      sidebarItem('/raw-materials', {
        group: 'Produk',
        label: 'Bahan Baku',
        moduleIcon: 'raw',
      }),
      sidebarItem('/packing-materials', {
        group: 'Produk',
        label: 'Bahan Kemasan',
        moduleIcon: 'packing',
      }),
      sidebarItem('/teranura', {
        group: 'Produk',
        label: 'Teranura',
        moduleIcon: 'teranura',
      }),
      sidebarItem('/stock-transaction', {
        group: 'Stok',
        label: 'Transaksi Stok',
        moduleIcon: 'stockMovement',
      }),
      sidebarItem('/stock-opname', {
        group: 'Stok',
        label: 'Stock Opname',
        moduleIcon: 'stockOpname',
      }),
      sidebarItem('/suppliers', {
        group: 'Pengadaan',
        label: 'Pemasok',
        moduleIcon: 'supplier',
      }),
      sidebarItem('/purchase-order', {
        group: 'Pengadaan',
        label: 'Pesanan Pembelian',
        moduleIcon: 'purchaseOrder',
      }),
      sidebarItem('/production', {
        group: 'Produksi',
        label: 'Produksi',
        moduleIcon: 'production',
      }),
      sidebarItem('/product-serials', {
        group: 'Produksi',
        label: 'Serial Produk',
        moduleIcon: 'serial',
      }),
      sidebarItem('/enclosures', {
        group: 'Produksi',
        label: 'Daftar Kandang',
        moduleIcon: 'enclosure',
      }),
      sidebarItem('/locations', {
        description: 'Kelola lokasi gudang, lantai, rak, dan area penyimpanan',
        group: undefined,
        label: 'Lokasi',
        moduleIcon: 'location',
      }),
    ],
  },
  {
    id: 'sales',
    title: 'Penjualan & Arus Kas',
    items: [
      sidebarItem('/sales', {
        group: 'Penjualan',
        label: 'Penjualan',
        moduleIcon: 'sales',
      }),
      sidebarItem('/source', {
        group: 'Penjualan',
        label: 'Sumber',
        moduleIcon: 'salesSource',
      }),
      sidebarItem('/complaints', { group: 'Penjualan', label: 'Komplain' }),
      // FE sales section: Layanan sits with Sales cluster (RNW = Penjualan group).
      sidebarItem('/layanan', { group: 'Penjualan', label: 'Layanan' }),
      sidebarItem('/terms-templates', {
        group: 'Penjualan',
        label: 'Syarat & Ketentuan',
      }),
      sidebarItem('/proyek', { group: 'Penjualan', label: 'Proyek' }),
      sidebarItem('/campaign', { group: 'Kampanye', label: 'Daftar' }),
      sidebarItem('/sales/discount-approval', {
        group: 'Kampanye',
        label: 'Persetujuan Diskon',
      }),
      sidebarItem('/vouchers', { group: 'Kampanye', label: 'Voucher' }),
      sidebarItem('/metode-pengiriman', {
        group: undefined,
        label: 'Metode Pengiriman',
      }),
    ],
  },
  {
    id: 'pusatAi',
    title: 'Pusat AI',
    items: [
      sidebarItem('/pusat-ai', { group: undefined, label: 'Pusat AI' }),
      sidebarItem('/campaign/dara-seo', {
        group: undefined,
        label: 'DARA SEO',
      }),
      sidebarItem('/campaign/dara-market-intel', {
        group: undefined,
        label: 'Intel Pasar',
      }),
      sidebarItem('/finance/tax', { group: undefined, label: 'DARA Pajak' }),
      sidebarItem('/list-of-users/dara-training', {
        group: undefined,
        label: 'Pelatihan DARA',
      }),
    ],
  },
  {
    id: 'finance',
    title: 'Keuangan',
    items: [
      sidebarItem('/finance', { label: 'Ringkasan Keuangan' }),
      sidebarItem('/wallet', { label: 'Dompet' }),
      sidebarItem('/asset-purchase', {
        group: 'Pengeluaran & Pemasukan',
        label: 'Pembelian Aset',
      }),
      sidebarItem('/commissions', {
        group: 'Pengeluaran & Pemasukan',
        label: 'Komisi',
      }),
      sidebarItem('/payable', {
        group: 'Pengeluaran & Pemasukan',
        label: 'Utang',
      }),
      sidebarItem('/receivable', {
        group: 'Pengeluaran & Pemasukan',
        label: 'Piutang',
      }),
      sidebarItem('/routine-expenses', {
        group: 'Pengeluaran & Pemasukan',
        label: 'Pengeluaran Rutin',
      }),
      sidebarItem('/unexpected-expense', {
        group: 'Pengeluaran & Pemasukan',
        label: 'Pengeluaran Tak Terduga',
      }),
      sidebarItem('/unexpected-income', {
        group: 'Pengeluaran & Pemasukan',
        label: 'Pemasukan Tak Terduga',
      }),
      sidebarItem('/finance/bonus', {
        group: 'Pengeluaran & Pemasukan',
        label: 'Bonus Karyawan',
      }),
      sidebarItem('/finance/payroll', { label: 'Penggajian' }),
    ],
  },
  {
    id: 'user',
    title: 'Pengguna',
    items: [
      sidebarItem('/customers', {
        group: 'Pelanggan',
        label: 'Daftar Pelanggan',
      }),
      sidebarItem('/list-of-users', {
        group: 'Daftar Pengguna',
        label: 'Daftar Pengguna',
      }),
      sidebarItem('/list-of-users/hr', {
        group: 'Daftar Pengguna',
        label: 'HR Sistem',
      }),
      sidebarItem('/list-of-users/kpi', {
        group: 'Daftar Pengguna',
        label: 'KPI Tim',
      }),
      sidebarItem('/task-manager', {
        group: 'Manajemen Tugas',
        label: 'Daftar Tugas',
        moduleIcon: 'taskManager',
      }),
      sidebarItem('/task-manager/settings/categories', {
        group: 'Manajemen Tugas',
        label: 'Pengaturan Kategori',
      }),
      sidebarItem('/task-manager/settings/task-types', {
        group: 'Manajemen Tugas',
        label: 'Tipe Tugas',
      }),
    ],
  },
];

function sidebarItem(
  route: string,
  overrides: Partial<
    Pick<KolamNavigationItem, 'description' | 'group' | 'label' | 'moduleIcon'>
  > = {},
): KolamNavigationItem {
  const base = getKolamNavigationItemByRoute(route) ?? {
    description:
      sidebarFallbackDescriptions[route] ??
      `${route} route dari menu FE Kolam.`,
    label: route.replace(/^\//, '') || 'Beranda',
    requiredAccess: ['kolam'] as Array<keyof AccessScope>,
    route,
  };

  return {
    ...base,
    ...overrides,
    route,
  };
}

const dashboardRuntimeRouteContexts: KolamNavigationItem[] = [
  {
    label: 'Inventory',
    route: '/inventory',
    description: 'Dashboard inventory summary and count cards',
    group: 'Dashboard',
    requiredAccess: ['kolam'],
  },
  {
    label: 'Layanan',
    route: '/layanan',
    description:
      'Ringkasan operasional, katalog paket, dan langganan pelanggan.',
    group: 'Layanan',
    requiredAccess: ['kolam'],
  },
];

const kolamNavigationRouteVariantSpecs: Array<{
  baseRoute: string;
  labelSuffix: string;
  /** When set, replaces `${baseLabel} ${labelSuffix}` for the shell title. */
  label?: string;
  route: string;
  description: string;
}> = [
  {
    baseRoute: '/brands',
    labelSuffix: 'Create',
    route: '/brands/create',
    description: 'Create brand page from live Kolam',
  },
  {
    baseRoute: '/brands',
    labelSuffix: 'Detail',
    route: '/brands/:id',
    description: 'Brand detail page from live Kolam',
  },
  {
    baseRoute: '/brands',
    labelSuffix: 'Edit',
    route: '/brands/:id/edit',
    description: 'Edit brand page from live Kolam',
  },
  {
    baseRoute: '/label-dan-field/merek',
    labelSuffix: 'Detail',
    route: '/label-dan-field/merek/:id',
    description: 'Detail merek dari Label dan Field Kolam',
  },
  {
    baseRoute: '/label-dan-field/merek',
    labelSuffix: 'Edit',
    route: '/label-dan-field/merek/:id/edit',
    description: 'Edit merek dari Label dan Field Kolam',
  },
  {
    baseRoute: '/label-dan-field/kategori',
    labelSuffix: 'Baru',
    route: '/label-dan-field/kategori/baru',
    description: 'Buat kategori dari Label dan Field Kolam',
  },
  {
    baseRoute: '/label-dan-field/kategori',
    labelSuffix: 'Detail',
    route: '/label-dan-field/kategori/:id',
    description: 'Detail kategori dari Label dan Field Kolam',
  },
  {
    baseRoute: '/label-dan-field/kategori',
    labelSuffix: 'Edit',
    route: '/label-dan-field/kategori/:id/edit',
    description: 'Edit kategori dari Label dan Field Kolam',
  },
  {
    baseRoute: '/tags',
    labelSuffix: 'Create',
    route: '/tags/create',
    description: 'Buat tag dari Kolam live',
  },
  {
    baseRoute: '/tags',
    labelSuffix: 'Detail',
    route: '/tags/:id',
    description: 'Detail tag dari Kolam live',
  },
  {
    baseRoute: '/tags',
    labelSuffix: 'Edit',
    route: '/tags/:id/edit',
    description: 'Edit tag dari Kolam live',
  },
  {
    baseRoute: '/custom-fields',
    labelSuffix: 'Create',
    route: '/custom-fields/create',
    description: 'Create custom field page from live Kolam',
  },
  {
    baseRoute: '/custom-fields',
    labelSuffix: 'Detail',
    route: '/custom-fields/:id',
    description: 'Detail field kustom dari live Kolam',
  },
  {
    baseRoute: '/custom-fields',
    labelSuffix: 'Edit',
    route: '/custom-fields/:id/edit',
    description: 'Edit custom field page from live Kolam',
  },
  {
    baseRoute: '/custom-field-profiles',
    labelSuffix: 'Create',
    route: '/custom-field-profiles/create',
    description: 'Create custom field profile page from live Kolam',
  },
  {
    baseRoute: '/custom-field-profiles',
    labelSuffix: 'Edit',
    route: '/custom-field-profiles/:id/edit',
    description: 'Edit custom field profile page from live Kolam',
  },
  {
    baseRoute: '/units',
    labelSuffix: 'Create',
    route: '/units/create',
    description: 'Create unit page from live Kolam',
  },
  {
    baseRoute: '/units',
    labelSuffix: 'Detail',
    route: '/units/:id',
    description: 'Unit detail page from live Kolam',
  },
  {
    baseRoute: '/units',
    labelSuffix: 'Edit',
    route: '/units/:id/edit',
    description: 'Edit unit page from live Kolam',
  },
  {
    baseRoute: '/products',
    labelSuffix: 'Baru',
    label: 'Produk Baru',
    route: '/products/create',
    description: 'Tambahkan produk baru ke katalog.',
  },
  {
    baseRoute: '/products',
    labelSuffix: 'Detail Produk',
    route: '/products/:id',
    description: '',
  },
  {
    baseRoute: '/products',
    labelSuffix: 'Edit',
    label: 'Edit Produk',
    route: '/products/:id/edit',
    description: 'Ubah informasi, harga, stok, dan keterangan produk.',
  },
  {
    baseRoute: '/products',
    labelSuffix: 'Arsip',
    label: 'Arsip Produk',
    route: '/products/archive',
    description: 'Halaman arsip produk dari Kolam live',
  },
  {
    baseRoute: '/raw-materials',
    labelSuffix: 'Create',
    route: '/raw-materials/create',
    description: 'Create raw material page from live Kolam',
  },
  {
    baseRoute: '/raw-materials',
    labelSuffix: 'Detail',
    route: '/raw-materials/:id',
    description: 'Raw material detail page from live Kolam',
  },
  {
    baseRoute: '/raw-materials',
    labelSuffix: 'Edit',
    label: 'Rubah Bahan Baku',
    route: '/raw-materials/:id/edit',
    description: 'Ubah informasi, harga, inventori, dan keterangan bahan baku.',
  },
  {
    baseRoute: '/species',
    labelSuffix: 'Create',
    route: '/species/create',
    description: 'Create species page from live Kolam',
  },
  {
    baseRoute: '/species',
    labelSuffix: 'Detail Spesies',
    route: '/species/:id',
    description: '',
  },
  {
    baseRoute: '/species',
    labelSuffix: 'Edit',
    route: '/species/:id/edit',
    description: 'Edit species page from live Kolam',
  },
  {
    baseRoute: '/taxonomy',
    labelSuffix: 'Create',
    route: '/taxonomy/create',
    description: 'Create taxonomy page from live Kolam',
  },
  {
    baseRoute: '/taxonomy',
    labelSuffix: 'Detail',
    route: '/taxonomy/:id',
    description: 'Taxonomy detail page from live Kolam',
  },
  {
    baseRoute: '/taxonomy',
    labelSuffix: 'Edit',
    route: '/taxonomy/:id/edit',
    description: 'Edit taxonomy page from live Kolam',
  },
  {
    baseRoute: '/iucn-status',
    labelSuffix: 'Create',
    route: '/iucn-status/create',
    description: 'Create IUCN status page from live Kolam',
  },
  {
    baseRoute: '/iucn-status',
    labelSuffix: 'Detail',
    route: '/iucn-status/:id',
    description: 'IUCN status detail page from live Kolam',
  },
  {
    baseRoute: '/iucn-status',
    labelSuffix: 'Edit',
    route: '/iucn-status/:id/edit',
    description: 'Edit IUCN status page from live Kolam',
  },
  {
    baseRoute: '/sales',
    labelSuffix: 'Baru',
    route: '/sales/create',
    description: 'Buat invoice penjualan baru.',
  },
  {
    baseRoute: '/sales',
    labelSuffix: 'Detail',
    label: 'Detail Penjualan',
    route: '/sales/:id',
    description: '',
  },
  {
    baseRoute: '/sales',
    labelSuffix: 'Ubah',
    label: 'Ubah Penjualan',
    route: '/sales/:id/edit',
    description: 'Perbarui transaksi penjualan dan kelola pesanan pelanggan.',
  },
  {
    baseRoute: '/source',
    labelSuffix: 'Baru',
    label: 'Sumber Penjualan Baru',
    route: '/source/create',
    description: 'Buat sumber penjualan baru.',
  },
  {
    baseRoute: '/source',
    labelSuffix: 'Detail',
    label: 'Detail Sumber Penjualan',
    route: '/source/:id',
    description: '',
  },
  {
    baseRoute: '/source',
    labelSuffix: 'Ubah',
    label: 'Ubah Sumber Penjualan',
    route: '/source/:id/edit',
    description: 'Perbarui data sumber penjualan.',
  },
  {
    baseRoute: '/complaints',
    labelSuffix: 'Baru',
    label: 'Komplain Baru',
    route: '/complaints/create',
    description: 'Buat tiket komplain baru dari invoice penjualan.',
  },
  {
    baseRoute: '/complaints',
    labelSuffix: 'Detail',
    label: 'Detail Komplain',
    route: '/complaints/:id',
    description: '',
  },
  {
    baseRoute: '/campaign',
    labelSuffix: 'Create',
    route: '/campaign/create',
    description: 'Create campaign page from live Kolam',
  },
  {
    baseRoute: '/campaign',
    labelSuffix: 'Detail',
    route: '/campaign/:id',
    description: 'Campaign detail page from live Kolam',
  },
  {
    baseRoute: '/campaign',
    labelSuffix: 'Edit',
    route: '/campaign/:id/edit',
    description: 'Edit campaign page from live Kolam',
  },
  {
    baseRoute: '/vouchers',
    labelSuffix: 'Create',
    route: '/vouchers/create',
    description: 'Create voucher page from live Kolam',
  },
  {
    baseRoute: '/vouchers',
    labelSuffix: 'Detail',
    route: '/vouchers/:id',
    description: 'Voucher detail page from live Kolam',
  },
  {
    baseRoute: '/vouchers',
    labelSuffix: 'Edit',
    route: '/vouchers/:id/edit',
    description: 'Edit voucher page from live Kolam',
  },
  {
    baseRoute: '/metode-pengiriman',
    labelSuffix: 'Baru',
    route: '/metode-pengiriman/create',
    description: 'Buat metode pengiriman baru',
  },
  {
    baseRoute: '/metode-pengiriman',
    labelSuffix: 'Detail',
    route: '/metode-pengiriman/:id',
    description: 'Detail metode pengiriman',
  },
  {
    baseRoute: '/metode-pengiriman',
    labelSuffix: 'Ubah',
    route: '/metode-pengiriman/:id/edit',
    description: 'Ubah metode pengiriman',
  },
  {
    baseRoute: '/cashflow-session',
    labelSuffix: 'Buat',
    route: '/cashflow-session/create',
    description: 'Halaman buat sesi tunai dari Kolam',
  },
  {
    baseRoute: '/cashflow-session',
    labelSuffix: 'Detail',
    route: '/cashflow-session/:id',
    description: 'Halaman detail sesi tunai dari Kolam',
  },
  {
    baseRoute: '/asset-purchase',
    labelSuffix: 'Create',
    label: 'Buat Pembelian Aset',
    route: '/asset-purchase/create',
    description: 'Buat pembelian aset',
  },
  {
    baseRoute: '/asset-purchase',
    labelSuffix: 'Detail',
    label: 'Detail Pembelian Aset',
    route: '/asset-purchase/:id',
    description: 'Detail dan informasi pembelian aset',
  },
  {
    baseRoute: '/asset-purchase',
    labelSuffix: 'Edit',
    label: 'Ubah Pembelian Aset',
    route: '/asset-purchase/:id/edit',
    description: 'Ubah pembelian aset',
  },
  {
    baseRoute: '/wallet',
    labelSuffix: 'Create',
    route: '/wallet/create',
    description: 'Create wallet page from live Kolam',
  },
  {
    baseRoute: '/wallet',
    labelSuffix: 'Detail',
    route: '/wallet/:id',
    description: 'Wallet detail page from live Kolam',
  },
  {
    baseRoute: '/wallet',
    labelSuffix: 'Edit',
    route: '/wallet/:id/edit',
    description: 'Edit wallet page from live Kolam',
  },
  {
    baseRoute: '/payable',
    labelSuffix: 'Baru',
    route: '/payable/create',
    description: 'Hutang baru',
  },
  {
    baseRoute: '/payable',
    labelSuffix: 'AP',
    route: '/payable/ap',
    description: 'Accounts payable page from live Kolam',
  },
  {
    baseRoute: '/payable',
    labelSuffix: 'Detail',
    route: '/payable/:id',
    description: 'Payable detail page from live Kolam',
  },
  {
    baseRoute: '/payable',
    labelSuffix: 'Edit',
    route: '/payable/:id/edit',
    description: 'Edit payable page from live Kolam',
  },
  {
    baseRoute: '/receivable',
    labelSuffix: 'Create',
    route: '/receivable/create',
    description: 'Create receivable page from live Kolam',
  },
  {
    baseRoute: '/receivable',
    labelSuffix: 'Edit',
    route: '/receivable/:id/edit',
    description: 'Edit receivable page from live Kolam',
  },
  {
    baseRoute: '/routine-expenses',
    labelSuffix: 'Create',
    label: 'Pengeluaran Rutin Baru',
    route: '/routine-expenses/create',
    description: 'Catat pengeluaran rutin bulanan',
  },
  {
    baseRoute: '/routine-expenses',
    labelSuffix: 'Detail',
    label: 'Detail Pengeluaran Rutin',
    route: '/routine-expenses/:id',
    description: 'Detail dan informasi pengeluaran rutin',
  },
  {
    baseRoute: '/routine-expenses',
    labelSuffix: 'Edit',
    label: 'Ubah Pengeluaran Rutin',
    route: '/routine-expenses/:id/edit',
    description: 'Ubah pengeluaran rutin',
  },
  {
    baseRoute: '/routine-expenses',
    labelSuffix: 'POS Rutin',
    label: 'POS Rutin',
    route: '/routine-expenses/pos-rutin',
    description: 'Bayar pengeluaran rutin dari template',
  },
  {
    baseRoute: '/unexpected-expense',
    labelSuffix: 'Create',
    label: 'Pengeluaran Tak Terduga Baru',
    route: '/unexpected-expense/create',
    description: 'Catat pengeluaran tak terduga',
  },
  {
    baseRoute: '/unexpected-expense',
    labelSuffix: 'Detail',
    label: 'Detail Pengeluaran Tak Terduga',
    route: '/unexpected-expense/:id',
    description: 'Detail dan informasi pengeluaran tak terduga',
  },
  {
    baseRoute: '/unexpected-expense',
    labelSuffix: 'Edit',
    label: 'Ubah Pengeluaran Tak Terduga',
    route: '/unexpected-expense/:id/edit',
    description: 'Ubah pengeluaran tak terduga',
  },
  {
    baseRoute: '/unexpected-income',
    labelSuffix: 'Create',
    label: 'Pemasukan Tak Terduga Baru',
    route: '/unexpected-income/create',
    description: 'Catat pemasukan tak terduga',
  },
  {
    baseRoute: '/unexpected-income',
    labelSuffix: 'Detail',
    label: 'Detail Pemasukan Tak Terduga',
    route: '/unexpected-income/:id',
    description: 'Detail dan informasi pemasukan tak terduga',
  },
  {
    baseRoute: '/unexpected-income',
    labelSuffix: 'Edit',
    label: 'Ubah Pemasukan Tak Terduga',
    route: '/unexpected-income/:id/edit',
    description: 'Ubah pemasukan tak terduga',
  },
  {
    baseRoute: '/payment-methods',
    labelSuffix: 'Create',
    route: '/payment-methods/create',
    description: 'Create payment method page from live Kolam',
  },
  {
    baseRoute: '/payment-methods',
    labelSuffix: 'Detail',
    route: '/payment-methods/:id',
    description: 'Payment method detail page from live Kolam',
  },
  {
    baseRoute: '/payment-methods',
    labelSuffix: 'Edit',
    route: '/payment-methods/:id/edit',
    description: 'Edit payment method page from live Kolam',
  },
  {
    baseRoute: '/customers',
    labelSuffix: 'Create',
    route: '/customers/create',
    description: 'Create customer page from live Kolam',
  },
  {
    baseRoute: '/customers',
    labelSuffix: 'Detail',
    route: '/customers/:id',
    description: 'Halaman detail pelanggan dari Kolam live',
  },
  {
    baseRoute: '/customers',
    labelSuffix: 'Edit',
    route: '/customers/:id/edit',
    description: 'Edit customer page from live Kolam',
  },
  {
    baseRoute: '/list-of-users',
    labelSuffix: 'Tambah Pengguna',
    route: '/list-of-users/users/create',
    description: '',
  },
  {
    baseRoute: '/list-of-users',
    labelSuffix: 'Detail Pengguna',
    route: '/list-of-users/users/:id',
    description: '',
  },
  {
    baseRoute: '/list-of-users',
    labelSuffix: 'Rubah Pengguna',
    route: '/list-of-users/users/:id/edit',
    description: '',
  },
  {
    baseRoute: '/list-of-users',
    labelSuffix: 'DARA Training',
    route: '/list-of-users/dara-training',
    description:
      'Kamus respons cepat, consent pengiriman, koreksi ranking produk, dan vision inbox (species + produk + bukti bayar).',
  },
  {
    baseRoute: '/list-of-users',
    labelSuffix: 'KPI',
    route: '/list-of-users/kpi',
    description: 'KPI staff page from live Kolam',
  },
  {
    baseRoute: '/assets',
    labelSuffix: 'Create',
    route: '/assets/create',
    description: 'Create asset page from live Kolam',
  },
  {
    baseRoute: '/assets',
    labelSuffix: 'Detail',
    route: '/assets/:id',
    description: 'Asset detail page from live Kolam',
  },
  {
    baseRoute: '/packing-materials',
    labelSuffix: 'Create',
    route: '/packing-materials/create',
    description: 'Halaman buat bahan kemasan dari Kolam live',
  },
  {
    baseRoute: '/packing-materials',
    labelSuffix: 'Detail',
    route: '/packing-materials/:id',
    description: 'Halaman detail bahan kemasan dari Kolam live',
  },
  {
    baseRoute: '/packing-materials',
    labelSuffix: 'Edit',
    route: '/packing-materials/:id/edit',
    description: 'Halaman rubah bahan kemasan dari Kolam live',
  },
  {
    baseRoute: '/suppliers',
    labelSuffix: 'Baru',
    route: '/suppliers/create',
    description: 'Tambah pemasok baru (fase berikutnya)',
  },
  {
    baseRoute: '/suppliers',
    label: 'Detil Pemasok',
    labelSuffix: 'Detail',
    route: '/suppliers/:id',
    description: 'Rincian kontak, status, dan katalog terkait pemasok',
  },
  {
    baseRoute: '/suppliers',
    labelSuffix: 'Edit',
    route: '/suppliers/:id/edit',
    description: 'Ubah data pemasok (fase berikutnya)',
  },
  {
    baseRoute: '/purchase-order',
    labelSuffix: 'Create',
    route: '/purchase-order/create',
    description: 'Create purchase order page from live Kolam',
  },
  {
    baseRoute: '/purchase-order',
    labelSuffix: 'Detail',
    route: '/purchase-order/:id',
    description: 'Purchase order detail page from live Kolam',
  },
  {
    baseRoute: '/purchase-order',
    labelSuffix: 'Edit',
    route: '/purchase-order/:id/edit',
    description: 'Edit purchase order page from live Kolam',
  },
  {
    baseRoute: '/production',
    label: 'Produksi Baru',
    labelSuffix: 'Create',
    route: '/production/create',
    description: 'Buat batch produksi baru',
  },
  {
    baseRoute: '/production',
    label: 'Detail Produksi',
    labelSuffix: 'Detail',
    route: '/production/:id',
    description: 'Rincian batch produksi',
  },
  {
    baseRoute: '/production',
    label: 'Edit Produksi',
    labelSuffix: 'Edit',
    route: '/production/:id/edit',
    description: 'Ubah data batch produksi',
  },
  {
    baseRoute: '/product-serials',
    label: 'Opname Serial',
    labelSuffix: 'Opname',
    route: '/product-serials/opname',
    description:
      'Verifikasi fisik nomor seri produk melalui pindai atau input manual',
  },
  {
    baseRoute: '/stock-opname',
    label: 'Stok Opname Baru',
    labelSuffix: 'Baru',
    route: '/stock-opname/new',
    description: 'Buat draf stok opname baru.',
  },
  {
    baseRoute: '/stock-opname',
    labelSuffix: 'Detail',
    route: '/stock-opname/:id',
    description: 'Stock opname detail page from live Kolam',
  },
  {
    baseRoute: '/stock-transaction',
    label: 'Detil Transaksi Stok',
    labelSuffix: 'Detail',
    route: '/stock-transaction/:id',
    description:
      'Rincian pergerakan stok, target, dan status sinkron marketplace',
  },
  {
    baseRoute: '/stock-transaction',
    labelSuffix: 'Opname',
    route: '/stock-transaction/opname',
    description: 'Stock transaction opname page from live Kolam',
  },
  {
    baseRoute: '/locations',
    labelSuffix: 'Tambah',
    route: '/locations/create',
    description: 'Tambah lokasi gudang, lantai, rak, dan area penyimpanan',
  },
  {
    baseRoute: '/locations',
    labelSuffix: 'Detail',
    route: '/locations/:id',
    description: 'Detail lokasi gudang, lantai, rak, dan area penyimpanan',
  },
  {
    baseRoute: '/locations',
    labelSuffix: 'Rubah',
    route: '/locations/:id/edit',
    description: 'Rubah lokasi gudang, lantai, rak, dan area penyimpanan',
  },
  {
    baseRoute: '/blogs',
    labelSuffix: 'Create',
    route: '/blogs/create',
    description: 'Create blog page from live Kolam',
  },
  {
    baseRoute: '/blogs',
    labelSuffix: 'Detail',
    route: '/blogs/:id',
    description: 'Blog detail page from live Kolam',
  },
  {
    baseRoute: '/blogs',
    labelSuffix: 'Edit',
    route: '/blogs/:id/edit',
    description: 'Edit blog page from live Kolam',
  },
  {
    baseRoute: '/blog-topics',
    labelSuffix: 'Create',
    route: '/blog-topics/create',
    description: 'Create blog topic page from live Kolam',
  },
  {
    baseRoute: '/blog-topics',
    labelSuffix: 'Edit',
    route: '/blog-topics/:id/edit',
    description: 'Edit blog topic page from live Kolam',
  },
  {
    baseRoute: '/terms-templates',
    labelSuffix: 'New',
    route: '/terms-templates/new',
    description: 'New terms template page from live Kolam',
  },
  {
    baseRoute: '/terms-templates',
    labelSuffix: 'Detail',
    route: '/terms-templates/:id',
    description: 'Terms template detail page from live Kolam',
  },
  {
    baseRoute: '/terms-templates',
    labelSuffix: 'Edit',
    route: '/terms-templates/:id/edit',
    description: 'Edit terms template page from live Kolam',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'Detail',
    route: '/proyek/:id',
    description: 'Detil proyek & surat penawaran',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'Edit',
    route: '/proyek/:id/edit',
    description: 'Detil proyek & surat penawaran',
  },
  {
    baseRoute: '/appointments',
    labelSuffix: 'Create',
    route: '/appointments/create',
    description: 'Create appointment page from live Kolam',
  },
  {
    baseRoute: '/appointments',
    labelSuffix: 'Detail',
    route: '/appointments/:id',
    description: 'Appointment detail page from live Kolam',
  },
  {
    baseRoute: '/appointments',
    labelSuffix: 'Edit',
    route: '/appointments/:id/edit',
    description: 'Edit appointment page from live Kolam',
  },
  {
    baseRoute: '/bantuan',
    labelSuffix: 'Article',
    route: '/bantuan/:slug',
    description: 'Bantuan article route from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-market-intel',
    labelSuffix: 'Persetujuan',
    label: 'Persetujuan Market Intelligence',
    route: '/campaign/dara-market-intel/approvals',
    description:
      'Review dan setujui rekomendasi pricing/pembelian — harga diterapkan manual di produk.',
  },
  {
    baseRoute: '/campaign/dara-market-intel',
    labelSuffix: 'Kompetitor',
    label: 'Monitor kompetitor',
    route: '/campaign/dara-market-intel/competitors',
    description: 'Daftar kompetitor dan barang yang dimonitor per channel.',
  },
  {
    baseRoute: '/campaign/dara-market-intel',
    labelSuffix: 'Kesehatan Toko',
    label: 'Kesehatan Toko',
    route: '/campaign/dara-market-intel/kesehatan',
    description:
      'Scan kelengkapan field Edit Produk — produk skor 100% tidak ditampilkan. Brand dinilai sebagai parameter, bukan filter.',
  },
  {
    baseRoute: '/campaign/dara-market-intel',
    labelSuffix: 'Peralatan',
    label: 'DARA Peralatan',
    route: '/campaign/dara-market-intel/peralatan',
    description:
      'Bulk harga & monitor biaya platform Shopee/Tokopedia — profil toko, URL regulasi, mapping AI fee untuk estimasi HPP.',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Persetujuan',
    label: 'Persetujuan Perubahan SEO',
    route: '/campaign/dara-seo/approvals',
    description:
      'Review draft AI untuk produk, blog, dan livestock — lalu terapkan setelah approve.',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Log audit',
    label: 'Audit Logs',
    route: '/campaign/dara-seo/audit-logs',
    description: 'Riwayat aktivitas DARA SEO.',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Integrasi',
    label: 'Integrasi sumber SEO',
    route: '/campaign/dara-seo/integrations',
    description:
      'SerpAPI, DuckDuckGo, SearXNG, GSC, Firecrawl, dan Indexing API — atur tanpa edit .env.',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Keywords',
    label: 'Keyword Opportunities',
    route: '/campaign/dara-seo/keywords',
    description:
      'Peluang keyword dari audit DARA SEO — prioritas berdasarkan skor peluang.',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Mentions',
    label: 'Brand & SERP Mentions',
    route: '/campaign/dara-seo/mentions',
    description: 'Mentions brand, hasil SERP, kompetitor, dan backlink.',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Ranking SERP',
    label: 'Ranking SERP',
    route: '/campaign/dara-seo/rankings',
    description:
      'Hasil yang sudah di-fetch & disimpan (cron, test integrasi, atau fetch manual).',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Sentimen',
    label: 'Analisis Sentimen',
    route: '/campaign/dara-seo/sentiment',
    description: 'Analisis sentimen teks review — rule-based atau Llama (AI).',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Social Insights',
    label: 'Social Insights',
    route: '/campaign/dara-seo/social-insights',
    description:
      'Instagram & TikTok via akun inbox AM. Setelah fetch, browser kembali standby poll DM.',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Website',
    label: 'SEO Website (Homepage)',
    route: '/campaign/dara-seo/website',
    description:
      'Meta title, description, dan keyword untuk halaman utama toko publik — perubahan via approval.',
  },
  {
    baseRoute: '/enclosures',
    labelSuffix: 'Detail',
    route: '/enclosures/:id',
    description: 'Detail kandang dari live Kolam',
  },
  {
    baseRoute: '/enclosures',
    labelSuffix: 'Edit',
    route: '/enclosures/:id/edit',
    description: 'Edit kandang dari live Kolam',
  },
  {
    baseRoute: '/finance',
    labelSuffix: 'Transaction Detail',
    route: '/finance/:txId',
    description: 'Halaman detail transaksi keuangan dari Kolam live',
  },
  {
    baseRoute: '/finance/payroll',
    labelSuffix: 'Periode',
    route: '/finance/payroll/:periodKey',
    description: 'Detail periode penggajian dari Kolam live',
  },
  {
    baseRoute: '/finance/bonus',
    labelSuffix: 'Tambah',
    route: '/finance/bonus/create',
    description: 'Tambah bonus karyawan untuk penggajian',
  },
  {
    baseRoute: '/finance/payroll',
    labelSuffix: 'Slip',
    route: '/finance/payroll/slip/:slipId',
    description: 'Slip gaji karyawan dari Kolam live',
  },
  {
    baseRoute: '/freyer',
    labelSuffix: 'Create',
    route: '/freyer/create',
    description: 'Create Freyer page from live Kolam',
  },
  {
    baseRoute: '/freyer',
    labelSuffix: 'Detail',
    route: '/freyer/:id',
    description: 'Freyer detail page from live Kolam',
  },
  {
    baseRoute: '/freyer',
    labelSuffix: 'Edit',
    route: '/freyer/:id/edit',
    description: 'Edit Freyer page from live Kolam',
  },
  {
    baseRoute: '/inbox',
    labelSuffix: 'Thread',
    route: '/inbox/:id',
    description: 'Inbox thread page from live Kolam',
  },
  {
    baseRoute: '/inbox',
    labelSuffix: 'Analytics',
    route: '/inbox/analytics',
    description: 'Inbox analytics page from live Kolam',
  },
  {
    baseRoute: '/inbox',
    labelSuffix: 'Demand Watch',
    route: '/inbox/demand-watch',
    description: 'Inbox demand watch page from live Kolam',
  },
  {
    baseRoute: '/inbox',
    labelSuffix: 'Pengaturan Label',
    route: '/inbox/settings/labels',
    description: 'Inbox label settings page from live Kolam',
  },
  {
    baseRoute: '/inbox',
    labelSuffix: 'Pengaturan Template',
    route: '/inbox/settings/templates',
    description: 'Inbox template settings page from live Kolam',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Create',
    route: '/layanan/create',
    description: 'Buat paket layanan baru',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Detail',
    route: '/layanan/:id',
    description: 'Detail paket layanan',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Edit',
    route: '/layanan/:id/edit',
    description: 'Ubah paket layanan',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Langganan',
    route: '/layanan/langganan/:id',
    description: 'Detail langganan',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Voucher',
    route: '/layanan/voucher/:id',
    description: 'Detail voucher layanan',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Voucher Execution',
    route: '/layanan/voucher/:id/execution/:executionId',
    description: 'Detail eksekusi kunjungan',
  },
  {
    baseRoute: '/notifications',
    labelSuffix: 'Detail',
    route: '/notifications/:id',
    description: 'Notification detail page from live Kolam',
  },
  {
    baseRoute: '/portal',
    labelSuffix: 'KPI',
    route: '/portal/kpi',
    description: 'Portal KPI page from live Kolam',
  },
  {
    baseRoute: '/portal',
    labelSuffix: 'Slip',
    route: '/portal/slip/:slipId',
    description: 'Portal slip page from live Kolam',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'New',
    route: '/proyek/new',
    description: 'Detil proyek & surat penawaran',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'Instances',
    route: '/proyek/instances',
    description: 'Detil proyek & surat penawaran',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'Detail',
    route: '/proyek/:ref',
    description: 'Detil proyek & surat penawaran',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'Edit',
    route: '/proyek/:ref/edit',
    description: 'Detil proyek & surat penawaran',
  },
  {
    baseRoute: '/task-manager',
    labelSuffix: 'Detail',
    route: '/task-manager/:id',
    description: 'Halaman detail tugas dari Kolam live',
  },
  {
    baseRoute: '/task-manager',
    labelSuffix: 'Kategori',
    route: '/task-manager/settings/categories',
    description: 'Halaman pengaturan kategori tugas dari Kolam live',
  },
  {
    baseRoute: '/task-manager',
    labelSuffix: 'Tipe Tugas',
    route: '/task-manager/settings/task-types',
    description: 'Halaman pengaturan tipe tugas dari Kolam live',
  },
  {
    baseRoute: '/task-manager',
    labelSuffix: 'Tugas Terjadwal',
    route: '/task-manager/tugas-terjadwal',
    description: 'Halaman tugas terjadwal dari Kolam live',
  },
  {
    baseRoute: '/teranura',
    labelSuffix: 'Create',
    route: '/teranura/create',
    description: 'Create Teranura page from live Kolam',
  },
  {
    baseRoute: '/teranura',
    labelSuffix: 'Detail',
    route: '/teranura/:id',
    description: 'Teranura detail page from live Kolam',
  },
  {
    baseRoute: '/teranura',
    labelSuffix: 'Edit',
    route: '/teranura/:id/edit',
    description: 'Edit Teranura page from live Kolam',
  },
  {
    baseRoute: '/teranura',
    labelSuffix: 'Statistics',
    route: '/teranura/:id/statistics',
    description: 'Teranura statistics page from live Kolam',
  },
  {
    baseRoute: '/teranura',
    labelSuffix: 'Freyr',
    route: '/teranura/freyr',
    description: 'Teranura Freyr page from live Kolam',
  },
  {
    baseRoute: '/teranura',
    labelSuffix: 'Freyr Detail',
    route: '/teranura/freyr/:id',
    description: 'Teranura Freyr detail page from live Kolam',
  },
];

export function getKolamNavigationRouteCount() {
  return kolamNavigationSections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
}

export function getKolamNavigationRouteVariants(
  sections = kolamNavigationSections,
): KolamNavigationRouteVariant[] {
  const itemsByRoute = new Map(
    sections.flatMap(section => section.items).map(item => [item.route, item]),
  );

  return kolamNavigationRouteVariantSpecs.flatMap(spec => {
    const baseItem = itemsByRoute.get(spec.baseRoute);

    if (!baseItem) {
      return [];
    }

    return [
      {
        ...baseItem,
        baseRoute: spec.baseRoute,
        label: spec.label ?? `${baseItem.label} ${spec.labelSuffix}`,
        route: spec.route,
        routePattern: spec.route,
        description: spec.description,
      },
    ];
  });
}

export function getKolamNavigationItemByRoute(
  route: string,
): KolamNavigationItem | null {
  return (
    kolamNavigationSections
      .flatMap(section => section.items)
      .find(item => item.route === route) ?? null
  );
}

export function getKolamNavigationItemByRuntimeRoute(
  route: string,
): KolamNavigationItem | null {
  const normalizedRoute = route.trim();

  if (!normalizedRoute) {
    return null;
  }

  const routePath = canonicalizeKolamShippingMethodRoute(
    normalizedRoute.split('?')[0],
  );
  const labelAndFieldsBrandItem = getLabelAndFieldsBrandNavigationItem(
    routePath,
    normalizedRoute,
  );
  const labelAndFieldsCategoryItem = getLabelAndFieldsCategoryNavigationItem(
    routePath,
    normalizedRoute,
  );

  if (labelAndFieldsBrandItem) {
    return labelAndFieldsBrandItem;
  }

  if (labelAndFieldsCategoryItem) {
    return labelAndFieldsCategoryItem;
  }

  const baseItems = [
    ...dashboardRuntimeRouteContexts,
    ...kolamNavigationSections.flatMap(section => section.items),
  ];
  const routeVariants = getKolamNavigationRouteVariants(
    kolamNavigationSections,
  );
  const items = [...baseItems, ...routeVariants];
  const exactItem = items.find(item => item.route === routePath);

  if (exactItem) {
    return { ...exactItem, route: normalizedRoute };
  }

  const dynamicVariant = routeVariants
    .filter(variant => routePatternMatches(variant.route, routePath))
    .sort((left, right) => right.route.length - left.route.length)[0];

  if (dynamicVariant) {
    return { ...dynamicVariant, route: normalizedRoute };
  }

  const prefixItem = baseItems
    .filter(
      item => item.route !== '/' && routePath.startsWith(`${item.route}/`),
    )
    .sort((left, right) => right.route.length - left.route.length)[0];

  return prefixItem ? { ...prefixItem, route: normalizedRoute } : null;
}

function getLabelAndFieldsBrandNavigationItem(
  routePath: string,
  normalizedRoute: string,
): KolamNavigationItem | null {
  if (routePath === '/label-dan-field/merek') {
    return {
      description: 'Kelola merek produk dari Label dan Field Kolam',
      group: 'Label dan Field',
      label: 'Merek',
      moduleIcon: 'brand',
      requiredAccess: ['kolam'],
      route: normalizedRoute,
    };
  }

  const brandDetail = routePath.match(
    /^\/label-dan-field\/merek\/([^/]+)(?:\/edit)?$/,
  );

  if (!brandDetail?.[1]) {
    return null;
  }

  if (brandDetail[1] === 'baru') {
    return {
      description: 'Buat merek baru dari Label dan Field Kolam',
      group: 'Label dan Field',
      label: 'Buat Merek Baru',
      moduleIcon: 'brand',
      requiredAccess: ['kolam'],
      route: normalizedRoute,
    };
  }

  return {
    description: 'Detail merek dari Label dan Field Kolam',
    group: 'Label dan Field',
    label: decodeURIComponent(brandDetail[1]).replace(/-/g, ' '),
    moduleIcon: 'brand',
    requiredAccess: ['kolam'],
    route: normalizedRoute,
  };
}

function getLabelAndFieldsCategoryNavigationItem(
  routePath: string,
  normalizedRoute: string,
): KolamNavigationItem | null {
  if (routePath === '/label-dan-field/kategori' || routePath === '/category') {
    return {
      description:
        'Kelola kategori produk dan spesies dari Label dan Field Kolam',
      group: 'Label dan Field',
      label: 'Kategori',
      requiredAccess: ['kolam'],
      route:
        routePath === '/category'
          ? '/label-dan-field/kategori'
          : normalizedRoute,
    };
  }

  const categoryDetail =
    routePath.match(/^\/label-dan-field\/kategori\/([^/]+)(?:\/edit)?$/) ??
    routePath.match(/^\/category\/([^/]+)(?:\/edit)?$/);

  if (!categoryDetail?.[1]) {
    return null;
  }

  if (categoryDetail[1] === 'baru') {
    return {
      description: 'Buat kategori baru dari Label dan Field Kolam',
      group: 'Label dan Field',
      label: 'Buat Kategori Baru',
      requiredAccess: ['kolam'],
      route: normalizedRoute.replace(
        /^\/category/,
        '/label-dan-field/kategori',
      ),
    };
  }

  return {
    description: 'Detail kategori dari Label dan Field Kolam',
    group: 'Label dan Field',
    label: decodeURIComponent(categoryDetail[1]).replace(/-/g, ' '),
    requiredAccess: ['kolam'],
    route: normalizedRoute.replace(/^\/category/, '/label-dan-field/kategori'),
  };
}

export function getKolamNavigationRouteSurfaceContract(
  item: KolamNavigationItem,
): KolamNavigationRouteSurfaceContract {
  if (isKolamNavigationRouteVariant(item)) {
    return {
      baseRoute: item.baseRoute,
      coverageEvidence: 'npm run verify:live-routes',
      routeKind: 'live-route-variant',
      routePattern: item.routePattern,
      runtimeRoute: item.route,
      sourcePath: 'src/app/(app)',
      sourceRepo: 'E:\\Projects\\_latest-da\\da-inventory-frontend',
    };
  }

  const isRuntimeContext = dashboardRuntimeRouteContexts.some(
    context => context.route === item.route,
  );

  return {
    baseRoute: item.route,
    coverageEvidence: 'npm run verify:live-routes',
    routeKind: isRuntimeContext ? 'runtime-context' : 'live-menu',
    routePattern: item.route,
    runtimeRoute: item.route,
    sourcePath: isRuntimeContext
      ? 'src/domain/dashboard-counts.ts / src/domain/dashboard-rail.ts'
      : 'src/components/app-sidebar.tsx',
    sourceRepo: isRuntimeContext
      ? 'E:\\Data\\Dunia-Anura\\KolamWindows'
      : 'E:\\Projects\\_latest-da\\da-inventory-frontend',
  };
}

function isKolamNavigationRouteVariant(
  item: KolamNavigationItem,
): item is KolamNavigationRouteVariant {
  return (
    'baseRoute' in item &&
    typeof item.baseRoute === 'string' &&
    'routePattern' in item &&
    typeof item.routePattern === 'string'
  );
}

function routePatternMatches(pattern: string, route: string): boolean {
  const patternSegments = pattern.split('/').filter(Boolean);
  const routeSegments = route.split('/').filter(Boolean);

  if (patternSegments.length !== routeSegments.length) {
    return false;
  }

  return patternSegments.every((segment, index) => {
    if (segment.startsWith(':')) {
      return routeSegments[index].length > 0;
    }

    return segment === routeSegments[index];
  });
}

export function getKolamNavigationLiveGroups(
  section: KolamNavigationSection,
): string[] {
  return section.items.reduce<string[]>((groups, item) => {
    if (item.group && !groups.includes(item.group)) {
      groups.push(item.group);
    }

    return groups;
  }, []);
}

export function getKolamNavigationChromeContract(): KolamNavigationChromeContract {
  return {
    disclosureCollapsedIconKind: 'chevron-right',
    disclosureExpandedIconKind: 'chevron-down',
    activeState: {
      background: 'primary/10',
      resolvedBackground: '#e8f6ed',
      foreground: 'primary',
      iconFill: 'primary/20',
    },
    reorderActions: [
      {
        id: 'move-up',
        label: 'Move section up',
        iconKind: 'chevron-up',
      },
      {
        id: 'move-down',
        label: 'Move section down',
        iconKind: 'chevron-down',
      },
    ],
    sourceComponent:
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\components\\app-sidebar.tsx',
  };
}

export function filterKolamNavigationSectionsByAccess(
  sections: KolamNavigationSection[],
  accessScope: AccessScope,
): KolamNavigationSection[] {
  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.requiredAccess.some(area => accessScope[area]),
      ),
    }))
    .filter(section => section.items.length > 0);
}

export function orderKolamNavigationSections(
  sections: KolamNavigationSection[],
  sectionOrder: string[],
): KolamNavigationSection[] {
  const byId = new Map(sections.map(section => [section.id, section]));
  const ordered = sectionOrder
    .map(sectionId => byId.get(sectionId))
    .filter((section): section is KolamNavigationSection => Boolean(section));
  const missing = sections.filter(
    section => !sectionOrder.includes(section.id),
  );

  return [...ordered, ...missing];
}

export function getKolamNavigationDisclosure(
  section: KolamNavigationSection,
  expanded: boolean,
  collapsedLimit = 2,
): KolamNavigationDisclosure {
  const visibleItems = expanded
    ? section.items
    : section.items.slice(0, collapsedLimit);
  const hiddenCount = Math.max(0, section.items.length - visibleItems.length);

  return {
    visibleItems,
    hiddenCount,
    countLabel: hiddenCount
      ? `${visibleItems.length}/${section.items.length}`
      : String(section.items.length),
  };
}

/**
 * Hub item for a sidebar section: item whose label matches the section title
 * (e.g. Pusat AI → /pusat-ai, Keuangan → /finance).
 */
export function getKolamNavigationSectionPrimaryItem(
  section: KolamNavigationSection,
): KolamNavigationItem | null {
  return section.items.find(item => item.label === section.title) ?? null;
}

/**
 * Sidebar section title for a runtime route (longest matching sidebar item).
 * Used by dashboard header eyebrow when `item.group` is unset.
 */
export function getKolamNavigationSectionTitleForRoute(
  route: string,
  sections: KolamNavigationSection[] = kolamSidebarNavigationSections,
): string | null {
  const path =
    String(route || '')
      .split('?')[0]
      .replace(/\/+$/, '') || '/';
  let best: { title: string; length: number } | null = null;

  for (const section of sections) {
    for (const item of section.items) {
      const itemPath =
        String(item.route || '')
          .split('?')[0]
          .replace(/\/+$/, '') || '/';
      const matches =
        path === itemPath ||
        (itemPath !== '/' && path.startsWith(`${itemPath}/`));
      if (!matches) {
        continue;
      }
      if (!best || itemPath.length > best.length) {
        best = { title: section.title, length: itemPath.length };
      }
    }
  }

  return best?.title ?? null;
}

export function getKolamNavigationRouteTarget(
  item: KolamNavigationItem,
): KolamNavigationRouteTarget {
  const routePath = item.route.split('?')[0];

  if (routePath === '/products' || routePath.startsWith('/products/')) {
    return routeTarget('kolam', item);
  }

  if (routePath === '/species' || routePath.startsWith('/species/')) {
    return routeTarget('kolam', item);
  }

  if (routePath === '/sales/discount-approval') {
    return routeTarget('kolam', item);
  }

  // Kolam backoffice penjualan (FE `/sales`). POS kasir tetap module terpisah.
  if (routePath === '/sales' || routePath.startsWith('/sales/')) {
    return routeTarget('kolam', item);
  }

  if (
    routePath === '/cashflow-session' ||
    routePath.startsWith('/cashflow-session/')
  ) {
    return routeTarget('kolam', item);
  }

  if (routePath === '/pos/cashflow' || routePath.startsWith('/pos/cashflow/')) {
    return routeTarget('cashflow', item);
  }

  if (routePath === '/customers' || routePath.startsWith('/customers/')) {
    return routeTarget('kolam', item);
  }

  if (routePath === '/pengaturan' || routePath === '/settings/activity-log') {
    return routeTarget('settings', item);
  }

  return routeTarget('kolam', item);
}

function routeTarget(
  moduleId: AppModule,
  item: KolamNavigationItem,
): KolamNavigationRouteTarget {
  return {
    moduleId,
    searchHint: item.route.replace(/^\//, '') || item.label,
    message: `${item.label} dibuka dari menu Kolam native (${item.route}).`,
  };
}
