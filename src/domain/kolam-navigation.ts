import type { AccessScope } from './auth';
import type { AppModule } from './app-shell';

export interface KolamNavigationItem {
  label: string;
  route: string;
  description: string;
  group?: string;
  requiredAccess: Array<keyof AccessScope>;
}

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
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        route: '/',
        description: 'Sales summary, stock, and business performance',
        requiredAccess: ['kolam', 'pos', 'am'],
      },
      {
        label: 'Inbox',
        route: '/inbox',
        description: 'Unified chat inbox - Tokopedia, Shopee, Store',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Team Chat',
        route: '/team-chat',
        description: 'Internal team chat workspace from live Kolam',
        group: 'Communication',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Notifications',
        route: '/notifications',
        description: 'Notification center and activity follow-ups',
        group: 'Communication',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Pusat AI',
        route: '/pusat-ai',
        description: 'AI assistant and automation entry point from live Kolam',
        group: 'Communication',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Bantuan',
        route: '/bantuan',
        description: 'Help center and operational documentation',
        group: 'Support',
        requiredAccess: ['kolam'],
      },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    items: [
      {
        label: 'Merek',
        route: '/brands',
        description: 'Kelola merek produk',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Kategori',
        route: '/label-dan-field/kategori',
        description:
          'Kelola kategori produk dan species dari Label and Fields Kolam',
        group: 'Label and Fields',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Tag',
        route: '/tags',
        description: 'Kelola tag untuk produk, layanan, dan species',
        group: 'Label and Fields',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Field Kustom',
        route: '/custom-fields',
        description: 'Kelola field tambahan untuk data produk dan katalog.',
        group: 'Label and Fields',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Custom Field Profiles',
        route: '/custom-field-profiles',
        description: 'Reusable custom field profile sets from live Kolam',
        group: 'Label and Fields',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Satuan',
        route: '/units',
        description: 'Kelola satuan pengukuran untuk produk dan spesies.',
        group: 'Label and Fields',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Products',
        route: '/products',
        description: 'List of products for sale',
        group: 'Products',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Raw Materials',
        route: '/raw-materials',
        description: 'Raw materials for production',
        group: 'Products',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Species',
        route: '/species',
        description: 'List of livestock species',
        group: 'Life Stocks',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Taxonomy',
        route: '/taxonomy',
        description: 'Classification and taxonomy hierarchy',
        group: 'Life Stocks',
        requiredAccess: ['kolam'],
      },
      {
        label: 'IUCN Status',
        route: '/iucn-status',
        description: 'Conservation status badges',
        group: 'Life Stocks',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Services',
        route: '/service',
        description: 'Services offered',
        group: 'Services',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Layanan',
        route: '/layanan',
        description: 'Live service order, voucher, and execution workspace',
        group: 'Services',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Pending Services',
        route: '/kontrol-layanan/pending-services',
        description: 'Service voucher list, unused and activated',
        group: 'Services',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Active Task',
        route: '/kontrol-layanan/active-tasks',
        description: 'Upcoming or current dosing and maintenance tasks',
        group: 'Services',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Stock Transactions',
        route: '/stock-transaction',
        description: 'Ledger movements and single-item opname',
        group: 'Stock',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Stock Opname',
        route: '/stock-opname',
        description: 'Multi-line counts, review, then post to stock',
        group: 'Stock',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Locations',
        route: '/locations',
        description: 'Warehouse and stock storage locations',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Assets',
        route: '/assets',
        description: 'Asset inventory tracked in the live Kolam app',
        group: 'Stock',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Packing Materials',
        route: '/packing-materials',
        description: 'Packing material master data for fulfillment',
        group: 'Stock',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Media',
        route: '/media',
        description: 'Browse all images and videos in the media folder',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Suppliers',
        route: '/suppliers',
        description: 'List of suppliers and vendors',
        group: 'Procurement',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Purchase Order',
        route: '/purchase-order',
        description: 'Create and manage purchase orders',
        group: 'Procurement',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Production',
        route: '/production',
        description: 'Manage production and manufacturing processes',
        group: 'Productions',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Serial Numbers',
        route: '/product-serials',
        description: 'Serial numbers and licenses per unit',
        group: 'Productions',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Enclosures',
        route: '/enclosures',
        description: 'Animal enclosure and habitat records from live Kolam',
        group: 'Life Stocks',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Teranura',
        route: '/teranura',
        description: 'Teranura animal records and statistics workspace',
        group: 'Life Stocks',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Freyer',
        route: '/freyer',
        description: 'Freyer breeding and hardware-linked records',
        group: 'Life Stocks',
        requiredAccess: ['kolam'],
      },
      {
        label: 'IoT Freyer',
        route: '/iot-freyer',
        description: 'IoT Freyer monitoring route from live Kolam',
        group: 'Life Stocks',
        requiredAccess: ['kolam'],
      },
    ],
  },
  {
    id: 'sales',
    title: 'Sales & Cashflow',
    items: [
      {
        label: 'Sales',
        route: '/sales',
        description: 'Sales transactions and payment status',
        group: 'Sales',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Sales Sources',
        route: '/source',
        description: 'Manage sales sources',
        group: 'Sales',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Cashflow Sessions',
        route: '/cashflow-session',
        description: 'Daily cash sessions and reconciliation',
        group: 'Sales',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Complaints',
        route: '/complaints',
        description: 'Manage complaint tickets and returns',
        group: 'Sales',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Campaign',
        route: '/campaign',
        description: 'Promotions, discounts, and vouchers',
        group: 'Campaign',
        requiredAccess: ['kolam'],
      },
      {
        label: 'DARA Jobs',
        route: '/campaign/dara-jobs',
        description: 'DARA campaign job queue from live Kolam',
        group: 'Campaign',
        requiredAccess: ['kolam'],
      },
      {
        label: 'DARA Marketing',
        route: '/campaign/dara-marketing',
        description: 'Marketing automation surface from live Kolam',
        group: 'Campaign',
        requiredAccess: ['kolam'],
      },
      {
        label: 'DARA Market Intel',
        route: '/campaign/dara-market-intel',
        description: 'Market intelligence workspace and approvals',
        group: 'Campaign',
        requiredAccess: ['kolam'],
      },
      {
        label: 'DARA SEO',
        route: '/campaign/dara-seo',
        description: 'SEO, keywords, rankings, sentiment, and integrations',
        group: 'Campaign',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Discount Approval',
        route: '/sales/discount-approval',
        description: 'Discount request approvals',
        group: 'Campaign',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Vouchers',
        route: '/vouchers',
        description: 'Discount codes for marketplace customers',
        group: 'Campaign',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Shipping Method',
        route: '/shipping-method',
        description: 'Available shipping methods',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Custom Project',
        route: '/custom-project',
        description: 'Custom project dashboard and project intake',
        group: 'Custom Project',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Custom Project Instances',
        route: '/custom-project/instances',
        description: 'Quotation, payment, and design review',
        group: 'Custom Project',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Surat Penawaran Baru',
        route: '/custom-project/instances/new',
        description: 'Buat custom project dan surat penawaran baru',
        group: 'Custom Project',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Terms & Conditions',
        route: '/terms-templates',
        description: 'Template syarat dan ketentuan untuk surat penawaran',
        group: 'Custom Project',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Proyek',
        route: '/proyek',
        description: 'Legacy project routes still present in live Kolam',
        group: 'Custom Project',
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
    title: 'Finance',
    items: [
      {
        label: 'Finance Summary',
        route: '/finance',
        description: 'Financial summary and reports',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Bonus',
        route: '/finance/bonus',
        description: 'Bonus and adjustment workspace from live Finance',
        group: 'Payroll & Tax',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Payroll',
        route: '/finance/payroll',
        description: 'Payroll period and slip management',
        group: 'Payroll & Tax',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Tax Profile',
        route: '/finance/settings/tax-profile',
        description: 'Tax profile settings used by Finance and payroll',
        group: 'Payroll & Tax',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Finance Tax',
        route: '/finance/tax',
        description: 'Finance tax reporting route from live Kolam',
        group: 'Payroll & Tax',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Wallet',
        route: '/wallet',
        description: 'Manage wallets and cash balances',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Asset Purchases',
        route: '/asset-purchase',
        description: 'Fixed asset purchases',
        group: 'Expenses & Income',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Commission',
        route: '/commissions',
        description: 'Sales commission accruals and releases',
        group: 'Expenses & Income',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Payable',
        route: '/payable',
        description: 'Debt and future payable tracking',
        group: 'Expenses & Income',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Receivables',
        route: '/receivable',
        description: 'Invoices and unpaid customer balance',
        group: 'Expenses & Income',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Routine Expenses',
        route: '/routine-expenses',
        description: 'Monthly routine expenses',
        group: 'Expenses & Income',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Unexpected Expenses',
        route: '/unexpected-expense',
        description: 'Unexpected expenses',
        group: 'Expenses & Income',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Unexpected Income',
        route: '/unexpected-income',
        description: 'Unexpected income',
        group: 'Expenses & Income',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Payment Method',
        route: '/payment-methods',
        description: 'Accepted payment methods',
        group: 'Finance Settings',
        requiredAccess: ['kolam'],
      },
    ],
  },
  {
    id: 'user',
    title: 'User',
    items: [
      {
        label: 'Customer',
        route: '/customers',
        description: 'Customer data and transaction history',
        group: 'Customer',
        requiredAccess: ['kolam', 'pos'],
      },
      {
        label: 'Customer Species',
        route: '/customer-species',
        description: "User's personal species collections",
        group: 'Customer',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Customer Storage Management',
        route: '/customer-storage',
        description: 'Customer storage items management',
        group: 'Customer',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Customer Storage Logs',
        route: '/customer-storage-logs',
        description: 'Customer storage activity logs',
        group: 'Customer',
        requiredAccess: ['kolam'],
      },
      {
        label: 'List of Users',
        route: '/list-of-users',
        description: 'System users and access rights',
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
        label: 'Task Manager',
        route: '/task-manager',
        description: 'Task manager, scheduled tasks, and task settings',
        group: 'Staff',
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
  {
    id: 'settings',
    title: 'Settings',
    items: [
      {
        label: 'Web Settings',
        route: '/settings/websetting',
        description: 'Web display and configuration settings',
        group: 'Web',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Settings Home',
        route: '/settings',
        description: 'Live settings landing route',
        group: 'System',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Web Settings Legacy',
        route: '/web-settings',
        description: 'Legacy web settings route still present in live Kolam',
        group: 'Web',
        requiredAccess: ['kolam'],
      },
      {
        label: 'App Downloads',
        route: '/app-downloads',
        description: 'Desktop and companion app downloads',
        group: 'System',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Sitemap',
        route: '/settings/sitemap',
        description: 'Configure XML sitemap served on the marketplace',
        group: 'Web',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Blog Post',
        route: '/blogs',
        description: 'Manage blog posts and content',
        group: 'Web',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Blog Topics',
        route: '/blog-topics',
        description: 'Manage blog topics for categorization',
        group: 'Web',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Role Management',
        route: '/settings/roles',
        description: 'Manage user roles and permissions',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Activity Log',
        route: '/settings/activity-log',
        description: 'Audit trail for navigation and API calls',
        requiredAccess: ['kolam'],
      },
      {
        label: 'AI Tools',
        route: '/settings/ai-tools',
        description: 'AI tool settings from the live Kolam settings area',
        group: 'System',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Alerts',
        route: '/settings/alerts',
        description: 'Operational alert configuration',
        group: 'System',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Maintenance',
        route: '/settings/maintenance',
        description: 'Maintenance controls and service mode settings',
        group: 'System',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Syncs',
        route: '/settings/syncs',
        description: 'Synchronization settings and status pages',
        group: 'System',
        requiredAccess: ['kolam'],
      },
      {
        label: 'System',
        route: '/settings/system',
        description: 'System-level Kolam configuration',
        group: 'System',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Tax Settings',
        route: '/settings/tax',
        description: 'Tax settings used by finance workflows',
        group: 'System',
        requiredAccess: ['kolam'],
      },
      {
        label: 'Marketplace Landing',
        route: '/settings/websetting/marketplace-landing',
        description: 'Marketplace landing page configuration',
        group: 'Web',
        requiredAccess: ['kolam'],
      },
    ],
  },
];

const sidebarFallbackDescriptions: Record<string, string> = {
  '/label-dan-field/merek': 'Kelola merek produk dari Label and Fields Kolam',
  '/label-dan-field/kategori':
    'Kelola kategori produk dan species dari Label and Fields Kolam',
  '/products/archive': 'Archived products (read-only history)',
  '/list-of-users/dara-training':
    'Frasa respons cepat dan training ranking produk',
  '/list-of-users/kpi': 'Dashboard kinerja tim (admin)',
  '/task-manager/settings/categories': 'Kategori dinamis (admin)',
  '/task-manager/settings/task-types':
    'Katalog tipe task dinamis (dosing, maintenance, custom)',
};

export const kolamSidebarNavigationSections: KolamNavigationSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    items: [sidebarItem('/', { label: 'Beranda' })],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    items: [
      sidebarItem('/label-dan-field/merek', {
        group: 'Label and Fields',
        label: 'Merek',
      }),
      sidebarItem('/label-dan-field/kategori', {
        group: 'Label and Fields',
        label: 'Kategori',
      }),
      sidebarItem('/tags', { group: 'Label and Fields', label: 'Tag' }),
      sidebarItem('/custom-fields', {
        group: 'Label and Fields',
        label: 'Field Kustom',
      }),
      sidebarItem('/units', { group: 'Label and Fields', label: 'Satuan' }),
      sidebarItem('/species', { group: 'Life Stocks' }),
      sidebarItem('/taxonomy', { group: 'Life Stocks', label: 'Taksonomi' }),
      sidebarItem('/iucn-status', {
        group: 'Life Stocks',
        label: 'Status IUCN',
      }),
      sidebarItem('/products', { group: 'Products' }),
      sidebarItem('/products/archive', { group: 'Products', label: 'Archive' }),
      sidebarItem('/raw-materials', { group: 'Products' }),
      sidebarItem('/packing-materials', { group: 'Products' }),
      sidebarItem('/teranura', { group: 'Products' }),
      sidebarItem('/stock-transaction', { group: 'Stock' }),
      sidebarItem('/stock-opname', { group: 'Stock' }),
      sidebarItem('/locations'),
      sidebarItem('/suppliers', { group: 'Procurement' }),
      sidebarItem('/purchase-order', { group: 'Procurement' }),
      sidebarItem('/production', { group: 'Productions', label: 'List' }),
      sidebarItem('/product-serials', { group: 'Productions' }),
      sidebarItem('/enclosures', {
        group: 'Productions',
        label: 'Daftar Enclosure',
      }),
    ],
  },
  {
    id: 'sales',
    title: 'Sales & Cashflow',
    items: [
      sidebarItem('/sales', { group: 'Sales', label: 'List' }),
      sidebarItem('/source', { group: 'Sales' }),
      sidebarItem('/complaints', { group: 'Sales' }),
      sidebarItem('/layanan'),
      sidebarItem('/terms-templates'),
      sidebarItem('/campaign', { group: 'Campaign', label: 'List' }),
      sidebarItem('/sales/discount-approval', { group: 'Campaign' }),
      sidebarItem('/vouchers', { group: 'Campaign' }),
      sidebarItem('/shipping-method'),
      sidebarItem('/proyek'),
    ],
  },
  {
    id: 'pusatAi',
    title: 'Pusat AI',
    items: [
      sidebarItem('/pusat-ai'),
      sidebarItem('/campaign/dara-seo'),
      sidebarItem('/campaign/dara-market-intel', { label: 'Market Intel' }),
      sidebarItem('/finance/tax', { label: 'DARA Pajak' }),
      sidebarItem('/list-of-users/dara-training', { label: 'Pelatihan DARA' }),
      sidebarItem('/campaign/dara-jobs', { label: 'Riwayat Proses DARA' }),
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    items: [
      sidebarItem('/finance'),
      sidebarItem('/wallet'),
      sidebarItem('/asset-purchase', { group: 'Expenses & Income' }),
      sidebarItem('/commissions', { group: 'Expenses & Income' }),
      sidebarItem('/payable', { group: 'Expenses & Income', label: 'Debt' }),
      sidebarItem('/receivable', { group: 'Expenses & Income' }),
      sidebarItem('/routine-expenses', { group: 'Expenses & Income' }),
      sidebarItem('/unexpected-expense', { group: 'Expenses & Income' }),
      sidebarItem('/unexpected-income', { group: 'Expenses & Income' }),
      sidebarItem('/finance/bonus', {
        group: 'Expenses & Income',
        label: 'Bonus Karyawan',
      }),
      sidebarItem('/finance/payroll'),
    ],
  },
  {
    id: 'user',
    title: 'User',
    items: [
      sidebarItem('/customers', { group: 'Customer', label: 'List' }),
      sidebarItem('/list-of-users', { group: 'List of Users' }),
      sidebarItem('/list-of-users/hr', {
        group: 'List of Users',
        label: 'HR Sistem',
      }),
      sidebarItem('/list-of-users/kpi', {
        group: 'List of Users',
        label: 'KPI Tim',
      }),
      sidebarItem('/task-manager', {
        group: 'Task Manager',
        label: 'Daftar Tugas',
      }),
      sidebarItem('/task-manager/settings/categories', {
        group: 'Task Manager',
        label: 'Pengaturan Kategori',
      }),
      sidebarItem('/task-manager/settings/task-types', {
        group: 'Task Manager',
        label: 'Tipe Task',
      }),
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    items: [sidebarItem('/settings/system', { label: 'Settings' })],
  },
];

function sidebarItem(
  route: string,
  overrides: Partial<
    Pick<KolamNavigationItem, 'description' | 'group' | 'label'>
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
    description: 'Dashboard service count route mapped to Kolam Services',
    group: 'Services',
    requiredAccess: ['kolam'],
  },
];

const kolamNavigationRouteVariantSpecs: Array<{
  baseRoute: string;
  labelSuffix: string;
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
    description: 'Detail merek dari Label and Fields Kolam',
  },
  {
    baseRoute: '/label-dan-field/merek',
    labelSuffix: 'Edit',
    route: '/label-dan-field/merek/:id/edit',
    description: 'Edit merek dari Label and Fields Kolam',
  },
  {
    baseRoute: '/label-dan-field/kategori',
    labelSuffix: 'Baru',
    route: '/label-dan-field/kategori/baru',
    description: 'Buat kategori dari Label and Fields Kolam',
  },
  {
    baseRoute: '/label-dan-field/kategori',
    labelSuffix: 'Detail',
    route: '/label-dan-field/kategori/:id',
    description: 'Detail kategori dari Label and Fields Kolam',
  },
  {
    baseRoute: '/label-dan-field/kategori',
    labelSuffix: 'Edit',
    route: '/label-dan-field/kategori/:id/edit',
    description: 'Edit kategori dari Label and Fields Kolam',
  },
  {
    baseRoute: '/tags',
    labelSuffix: 'Create',
    route: '/tags/create',
    description: 'Create tag page from live Kolam',
  },
  {
    baseRoute: '/tags',
    labelSuffix: 'Detail',
    route: '/tags/:id',
    description: 'Tag detail page from live Kolam',
  },
  {
    baseRoute: '/tags',
    labelSuffix: 'Edit',
    route: '/tags/:id/edit',
    description: 'Edit tag page from live Kolam',
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
    labelSuffix: 'Create',
    route: '/products/create',
    description: 'Create product page from live Kolam',
  },
  {
    baseRoute: '/products',
    labelSuffix: 'Detail',
    route: '/products/:id',
    description: 'Product detail page from live Kolam',
  },
  {
    baseRoute: '/products',
    labelSuffix: 'Edit',
    route: '/products/:id/edit',
    description: 'Edit product page from live Kolam',
  },
  {
    baseRoute: '/products',
    labelSuffix: 'Archive',
    route: '/products/archive',
    description: 'Archived products page from live Kolam',
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
    route: '/raw-materials/:id/edit',
    description: 'Edit raw material page from live Kolam',
  },
  {
    baseRoute: '/species',
    labelSuffix: 'Create',
    route: '/species/create',
    description: 'Create species page from live Kolam',
  },
  {
    baseRoute: '/species',
    labelSuffix: 'Detail',
    route: '/species/:id',
    description: 'Species detail page from live Kolam',
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
    labelSuffix: 'Create',
    route: '/sales/create',
    description: 'Create sales page from live Kolam',
  },
  {
    baseRoute: '/sales',
    labelSuffix: 'Detail',
    route: '/sales/:id',
    description: 'Sales detail page from live Kolam',
  },
  {
    baseRoute: '/sales',
    labelSuffix: 'Edit',
    route: '/sales/:id/edit',
    description: 'Edit sales page from live Kolam',
  },
  {
    baseRoute: '/source',
    labelSuffix: 'Create',
    route: '/source/create',
    description: 'Create sales source page from live Kolam',
  },
  {
    baseRoute: '/source',
    labelSuffix: 'Detail',
    route: '/source/:id',
    description: 'Sales source detail page from live Kolam',
  },
  {
    baseRoute: '/source',
    labelSuffix: 'Edit',
    route: '/source/:id/edit',
    description: 'Edit sales source page from live Kolam',
  },
  {
    baseRoute: '/complaints',
    labelSuffix: 'Create',
    route: '/complaints/create',
    description: 'Create complaint page from live Kolam',
  },
  {
    baseRoute: '/complaints',
    labelSuffix: 'Detail',
    route: '/complaints/:id',
    description: 'Complaint detail page from live Kolam',
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
    baseRoute: '/shipping-method',
    labelSuffix: 'Create',
    route: '/shipping-method/create',
    description: 'Create shipping method page from live Kolam',
  },
  {
    baseRoute: '/shipping-method',
    labelSuffix: 'Detail',
    route: '/shipping-method/:id',
    description: 'Shipping method detail page from live Kolam',
  },
  {
    baseRoute: '/shipping-method',
    labelSuffix: 'Edit',
    route: '/shipping-method/:id/edit',
    description: 'Edit shipping method page from live Kolam',
  },
  {
    baseRoute: '/cashflow-session',
    labelSuffix: 'Create',
    route: '/cashflow-session/create',
    description: 'Create cashflow session page from live Kolam',
  },
  {
    baseRoute: '/cashflow-session',
    labelSuffix: 'Detail',
    route: '/cashflow-session/:id',
    description: 'Cashflow session detail page from live Kolam',
  },
  {
    baseRoute: '/asset-purchase',
    labelSuffix: 'Create',
    route: '/asset-purchase/create',
    description: 'Create asset purchase page from live Kolam',
  },
  {
    baseRoute: '/asset-purchase',
    labelSuffix: 'Detail',
    route: '/asset-purchase/:id',
    description: 'Asset purchase detail page from live Kolam',
  },
  {
    baseRoute: '/asset-purchase',
    labelSuffix: 'Edit',
    route: '/asset-purchase/:id/edit',
    description: 'Edit asset purchase page from live Kolam',
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
    labelSuffix: 'Create',
    route: '/payable/create',
    description: 'Create payable page from live Kolam',
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
    route: '/routine-expenses/create',
    description: 'Create routine expense page from live Kolam',
  },
  {
    baseRoute: '/routine-expenses',
    labelSuffix: 'Detail',
    route: '/routine-expenses/:id',
    description: 'Routine expense detail page from live Kolam',
  },
  {
    baseRoute: '/routine-expenses',
    labelSuffix: 'Edit',
    route: '/routine-expenses/:id/edit',
    description: 'Edit routine expense page from live Kolam',
  },
  {
    baseRoute: '/routine-expenses',
    labelSuffix: 'POS Rutin',
    route: '/routine-expenses/pos-rutin',
    description: 'POS routine expense page from live Kolam',
  },
  {
    baseRoute: '/unexpected-expense',
    labelSuffix: 'Create',
    route: '/unexpected-expense/create',
    description: 'Create unexpected expense page from live Kolam',
  },
  {
    baseRoute: '/unexpected-expense',
    labelSuffix: 'Detail',
    route: '/unexpected-expense/:id',
    description: 'Unexpected expense detail page from live Kolam',
  },
  {
    baseRoute: '/unexpected-expense',
    labelSuffix: 'Edit',
    route: '/unexpected-expense/:id/edit',
    description: 'Edit unexpected expense page from live Kolam',
  },
  {
    baseRoute: '/unexpected-income',
    labelSuffix: 'Create',
    route: '/unexpected-income/create',
    description: 'Create unexpected income page from live Kolam',
  },
  {
    baseRoute: '/unexpected-income',
    labelSuffix: 'Detail',
    route: '/unexpected-income/:id',
    description: 'Unexpected income detail page from live Kolam',
  },
  {
    baseRoute: '/unexpected-income',
    labelSuffix: 'Edit',
    route: '/unexpected-income/:id/edit',
    description: 'Edit unexpected income page from live Kolam',
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
    description: 'Customer detail page from live Kolam',
  },
  {
    baseRoute: '/customers',
    labelSuffix: 'Edit',
    route: '/customers/:id/edit',
    description: 'Edit customer page from live Kolam',
  },
  {
    baseRoute: '/list-of-users',
    labelSuffix: 'User Detail',
    route: '/list-of-users/users/:id',
    description: 'User detail page from live Kolam',
  },
  {
    baseRoute: '/list-of-users',
    labelSuffix: 'User Edit',
    route: '/list-of-users/users/:id/edit',
    description: 'Edit user page from live Kolam',
  },
  {
    baseRoute: '/list-of-users',
    labelSuffix: 'DARA Training',
    route: '/list-of-users/dara-training',
    description: 'DARA training page from live Kolam',
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
    description: 'Create packing material page from live Kolam',
  },
  {
    baseRoute: '/packing-materials',
    labelSuffix: 'Detail',
    route: '/packing-materials/:id',
    description: 'Packing material detail page from live Kolam',
  },
  {
    baseRoute: '/packing-materials',
    labelSuffix: 'Edit',
    route: '/packing-materials/:id/edit',
    description: 'Edit packing material page from live Kolam',
  },
  {
    baseRoute: '/suppliers',
    labelSuffix: 'Create',
    route: '/suppliers/create',
    description: 'Create supplier page from live Kolam',
  },
  {
    baseRoute: '/suppliers',
    labelSuffix: 'Detail',
    route: '/suppliers/:id',
    description: 'Supplier detail page from live Kolam',
  },
  {
    baseRoute: '/suppliers',
    labelSuffix: 'Edit',
    route: '/suppliers/:id/edit',
    description: 'Edit supplier page from live Kolam',
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
    labelSuffix: 'Create',
    route: '/production/create',
    description: 'Create production page from live Kolam',
  },
  {
    baseRoute: '/production',
    labelSuffix: 'Detail',
    route: '/production/:id',
    description: 'Production detail page from live Kolam',
  },
  {
    baseRoute: '/production',
    labelSuffix: 'Edit',
    route: '/production/:id/edit',
    description: 'Edit production page from live Kolam',
  },
  {
    baseRoute: '/product-serials',
    labelSuffix: 'Opname',
    route: '/product-serials/opname',
    description: 'Product serial opname page from live Kolam',
  },
  {
    baseRoute: '/stock-opname',
    labelSuffix: 'New',
    route: '/stock-opname/new',
    description: 'New stock opname page from live Kolam',
  },
  {
    baseRoute: '/stock-opname',
    labelSuffix: 'Detail',
    route: '/stock-opname/:id',
    description: 'Stock opname detail page from live Kolam',
  },
  {
    baseRoute: '/stock-transaction',
    labelSuffix: 'Detail',
    route: '/stock-transaction/:id',
    description: 'Stock transaction detail page from live Kolam',
  },
  {
    baseRoute: '/stock-transaction',
    labelSuffix: 'Opname',
    route: '/stock-transaction/opname',
    description: 'Stock transaction opname page from live Kolam',
  },
  {
    baseRoute: '/locations',
    labelSuffix: 'Create',
    route: '/locations/create',
    description: 'Create location page from live Kolam',
  },
  {
    baseRoute: '/locations',
    labelSuffix: 'Detail',
    route: '/locations/:id',
    description: 'Location detail page from live Kolam',
  },
  {
    baseRoute: '/locations',
    labelSuffix: 'Edit',
    route: '/locations/:id/edit',
    description: 'Edit location page from live Kolam',
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
    baseRoute: '/custom-project/instances',
    labelSuffix: 'Detail',
    route: '/custom-project/instances/:id',
    description: 'Custom project instance detail page from live Kolam',
  },
  {
    baseRoute: '/custom-project/instances',
    labelSuffix: 'Edit',
    route: '/custom-project/instances/:id/edit',
    description: 'Edit custom project instance page from live Kolam',
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
    labelSuffix: 'Approvals',
    route: '/campaign/dara-market-intel/approvals',
    description: 'DARA market intel approvals page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-market-intel',
    labelSuffix: 'Competitors',
    route: '/campaign/dara-market-intel/competitors',
    description: 'DARA market intel competitors page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-market-intel',
    labelSuffix: 'Kesehatan',
    route: '/campaign/dara-market-intel/kesehatan',
    description: 'DARA market intel kesehatan page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-market-intel',
    labelSuffix: 'Peralatan',
    route: '/campaign/dara-market-intel/peralatan',
    description: 'DARA market intel peralatan page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Approvals',
    route: '/campaign/dara-seo/approvals',
    description: 'DARA SEO approvals page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Audit Logs',
    route: '/campaign/dara-seo/audit-logs',
    description: 'DARA SEO audit logs page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Integrations',
    route: '/campaign/dara-seo/integrations',
    description: 'DARA SEO integrations page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Keywords',
    route: '/campaign/dara-seo/keywords',
    description: 'DARA SEO keywords page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Mentions',
    route: '/campaign/dara-seo/mentions',
    description: 'DARA SEO mentions page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Rankings',
    route: '/campaign/dara-seo/rankings',
    description: 'DARA SEO rankings page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Sentiment',
    route: '/campaign/dara-seo/sentiment',
    description: 'DARA SEO sentiment page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Social Insights',
    route: '/campaign/dara-seo/social-insights',
    description: 'DARA SEO social insights page from live Kolam',
  },
  {
    baseRoute: '/campaign/dara-seo',
    labelSuffix: 'Website',
    route: '/campaign/dara-seo/website',
    description: 'DARA SEO website page from live Kolam',
  },
  {
    baseRoute: '/enclosures',
    labelSuffix: 'Detail',
    route: '/enclosures/:id',
    description: 'Enclosure detail page from live Kolam',
  },
  {
    baseRoute: '/enclosures',
    labelSuffix: 'Edit',
    route: '/enclosures/:id/edit',
    description: 'Edit enclosure page from live Kolam',
  },
  {
    baseRoute: '/finance',
    labelSuffix: 'Transaction Detail',
    route: '/finance/:txId',
    description: 'Finance transaction detail page from live Kolam',
  },
  {
    baseRoute: '/finance/payroll',
    labelSuffix: 'Period',
    route: '/finance/payroll/:periodKey',
    description: 'Payroll period page from live Kolam',
  },
  {
    baseRoute: '/finance/payroll',
    labelSuffix: 'Slip',
    route: '/finance/payroll/slip/:slipId',
    description: 'Payroll slip page from live Kolam',
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
    labelSuffix: 'Label Settings',
    route: '/inbox/settings/labels',
    description: 'Inbox label settings page from live Kolam',
  },
  {
    baseRoute: '/inbox',
    labelSuffix: 'Template Settings',
    route: '/inbox/settings/templates',
    description: 'Inbox template settings page from live Kolam',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Create',
    route: '/layanan/create',
    description: 'Create layanan page from live Kolam',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Detail',
    route: '/layanan/:id',
    description: 'Layanan detail page from live Kolam',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Edit',
    route: '/layanan/:id/edit',
    description: 'Edit layanan page from live Kolam',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Langganan',
    route: '/layanan/langganan/:id',
    description: 'Layanan subscription page from live Kolam',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Voucher',
    route: '/layanan/voucher/:id',
    description: 'Layanan voucher page from live Kolam',
  },
  {
    baseRoute: '/layanan',
    labelSuffix: 'Voucher Execution',
    route: '/layanan/voucher/:id/execution/:executionId',
    description: 'Layanan voucher execution page from live Kolam',
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
    description: 'New proyek page from live Kolam',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'Instances',
    route: '/proyek/instances',
    description: 'Proyek instances page from live Kolam',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'Detail',
    route: '/proyek/:ref',
    description: 'Proyek detail page from live Kolam',
  },
  {
    baseRoute: '/proyek',
    labelSuffix: 'Edit',
    route: '/proyek/:ref/edit',
    description: 'Edit proyek page from live Kolam',
  },
  {
    baseRoute: '/task-manager',
    labelSuffix: 'Detail',
    route: '/task-manager/:id',
    description: 'Task manager detail page from live Kolam',
  },
  {
    baseRoute: '/task-manager',
    labelSuffix: 'Categories',
    route: '/task-manager/settings/categories',
    description: 'Task manager category settings page from live Kolam',
  },
  {
    baseRoute: '/task-manager',
    labelSuffix: 'Task Types',
    route: '/task-manager/settings/task-types',
    description: 'Task manager task type settings page from live Kolam',
  },
  {
    baseRoute: '/task-manager',
    labelSuffix: 'Scheduled',
    route: '/task-manager/tugas-terjadwal',
    description: 'Scheduled task manager page from live Kolam',
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
        label: `${baseItem.label} ${spec.labelSuffix}`,
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

  const routePath = normalizedRoute.split('?')[0];
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
      description: 'Kelola merek produk dari Label and Fields Kolam',
      group: 'Label and Fields',
      label: 'Merek',
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
      description: 'Buat merek baru dari Label and Fields Kolam',
      group: 'Label and Fields',
      label: 'Buat Merek Baru',
      requiredAccess: ['kolam'],
      route: normalizedRoute,
    };
  }

  return {
    description: 'Detail merek dari Label and Fields Kolam',
    group: 'Label and Fields',
    label: decodeURIComponent(brandDetail[1]).replace(/-/g, ' '),
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
        'Kelola kategori produk dan species dari Label and Fields Kolam',
      group: 'Label and Fields',
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
      description: 'Buat kategori baru dari Label and Fields Kolam',
      group: 'Label and Fields',
      label: 'Buat Kategori Baru',
      requiredAccess: ['kolam'],
      route: normalizedRoute.replace(/^\/category/, '/label-dan-field/kategori'),
    };
  }

  return {
    description: 'Detail kategori dari Label and Fields Kolam',
    group: 'Label and Fields',
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

export function getKolamNavigationRouteTarget(
  item: KolamNavigationItem,
): KolamNavigationRouteTarget {
  const routePath = item.route.split('?')[0];

  if (
    routePath === '/products' ||
    routePath.startsWith('/products/') ||
    routePath === '/species' ||
    routePath.startsWith('/species/')
  ) {
    return routeTarget('catalog', item);
  }

  if (routePath === '/sales/discount-approval') {
    return routeTarget('kolam', item);
  }

  if (routePath === '/sales' || routePath.startsWith('/sales/')) {
    return routeTarget('sales', item);
  }

  if (
    routePath === '/cashflow-session' ||
    routePath.startsWith('/cashflow-session/')
  ) {
    return routeTarget('cashflow', item);
  }

  if (routePath === '/customers' || routePath.startsWith('/customers/')) {
    return routeTarget('customer', item);
  }

  if (routePath.startsWith('/settings')) {
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
    message: `${item.label} dibuka dari Kolam Menu native (${item.route}).`,
  };
}
