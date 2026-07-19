export type AppArea = 'kolam' | 'pos' | 'am' | 'plugins' | 'preparation';

export type AppModule =
  | 'kolam'
  | 'settings'
  | 'checkout'
  | 'catalog'
  | 'sales'
  | 'cashflow'
  | 'customer'
  | 'am'
  | 'plugins'
  | 'preparation';

export type ShellModuleIconKind =
  | 'dashboard'
  | 'settings'
  | 'cart'
  | 'catalog'
  | 'sales'
  | 'wallet'
  | 'people'
  | 'automation'
  | 'plugin'
  | 'preparation';

export interface ShellModule {
  id: AppModule;
  area: AppArea;
  label: string;
  iconKind: ShellModuleIconKind;
  sourceRepo: string;
  summary: string;
  routes: string[];
}

export interface ShellModuleRouteEntry {
  id: string;
  area: AppArea;
  moduleId: AppModule;
  moduleLabel: string;
  route: string;
  description: string;
  sourceRepo: string;
}

export interface ShellAreaCoverage {
  area: AppArea;
  moduleCount: number;
  routeCount: number;
  summaryLabel: string;
}

export interface SidebarBrand {
  title: string;
  subtitle: string;
  sourceRepo: string;
  sourceComponent: string;
  expandedSize: {
    width: number;
    height: number;
  };
  collapsedSize: number;
  palette: {
    darkLeaf: string;
    brightLeaf: string;
    deepGreen: string;
    redAccent: string;
    cream: string;
    yellow: string;
  };
}

export const sidebarBrand: SidebarBrand = {
  title: 'JungleSystem',
  subtitle: 'Dunia Anura',
  sourceRepo: 'https://github.com/daraAI-ux/JungleSystem',
  sourceComponent:
    'E:\\Dunia Anura\\logo\\logo\\Logo Jungle System\\Logo\\Color\\Logo Jungle System Color.jpg',
  expandedSize: {
    width: 184,
    height: 72,
  },
  collapsedSize: 48,
  palette: {
    darkLeaf: '#29381C',
    brightLeaf: '#2EB028',
    deepGreen: '#185406',
    redAccent: '#A32D2C',
    cream: '#D1C79D',
    yellow: '#F4A512',
  },
};

export const shellModules: ShellModule[] = [
  {
    id: 'kolam',
    area: 'kolam',
    label: 'Kolam',
    iconKind: 'dashboard',
    sourceRepo: 'E:\\Projects\\_latest-da\\da-inventory-frontend',
    summary:
      'Operasional internal, inventory, finance, proyek, service, dan panel Kolam.',
    routes: [
      '/',
      'inbox',
      'team-chat',
      'notifications',
      'pusat-ai',
      'bantuan',
      'app-downloads',
      'brands',
      'category',
      'tags',
      'custom-fields',
      'custom-field-profiles',
      'units',
      'products',
      'raw-materials',
      'species',
      'taxonomy',
      'iucn-status',
      'service',
      'layanan',
      'kontrol-layanan/pending-services',
      'kontrol-layanan/active-tasks',
      'sales',
      'source',
      'cashflow-session',
      'complaints',
      'campaign',
      'campaign/dara-jobs',
      'campaign/dara-marketing',
      'campaign/dara-market-intel',
      'campaign/dara-seo',
      'sales/discount-approval',
      'vouchers',
      'shipping-method',
      'finance',
      'wallet',
      'asset-purchase',
      'commissions',
      'payable',
      'receivable',
      'routine-expenses',
      'unexpected-expense',
      'unexpected-income',
      'payment-methods',
      'customers',
      'customer-species',
      'customer-storage',
      'customer-storage-logs',
      'list-of-users',
      'custom-project',
      'custom-project/instances',
      'custom-project/instances/new',
      'terms-templates',
      'proyek',
      'appointments',
      'kontrol-layanan',
      'stock-transaction',
      'stock-opname',
      'locations',
      'assets',
      'packing-materials',
      'media',
      'suppliers',
      'purchase-order',
      'production',
      'product-serials',
      'enclosures',
      'teranura',
      'freyer',
      'iot-freyer',
      'enclonura-species',
      'species-request',
      'taxonomy-request',
      'storage-management',
      'storage-history',
      'blogs',
      'blog-topics',
      'finance/bonus',
      'finance/payroll',
      'finance/settings/tax-profile',
      'finance/tax',
      'list-of-users/hr',
      'list-of-users/overtime',
      'staff-attendance',
      'staff-attendance/leaves',
      'staff-attendance/me',
      'portal',
      'task-manager',
      'settings',
      'settings/websetting',
      'settings/sitemap',
      'settings/roles',
      'settings/activity-log',
      'settings/ai-tools',
      'settings/alerts',
      'settings/maintenance',
      'settings/syncs',
      'settings/system',
      'settings/tax',
      'settings/websetting/marketplace-landing',
      'web-settings',
    ],
  },
  {
    id: 'settings',
    area: 'kolam',
    label: 'Settings',
    iconKind: 'settings',
    sourceRepo: 'E:\\Projects\\_latest-da\\da-inventory-frontend',
    summary:
      'Pengaturan web, role management, activity log, dan audit akses Kolam.',
    routes: [
      'settings/websetting',
      'settings/sitemap',
      'settings/roles',
      'settings/activity-log',
    ],
  },
  {
    id: 'checkout',
    area: 'pos',
    label: 'Checkout',
    iconKind: 'cart',
    sourceRepo: 'E:\\Projects\\da-pos',
    summary: 'Alur checkout kasir native untuk product dan species sellable.',
    routes: ['/', 'checkout', 'cart', 'payment', 'sale-draft'],
  },
  {
    id: 'catalog',
    area: 'pos',
    label: 'Katalog',
    iconKind: 'catalog',
    sourceRepo: 'E:\\Projects\\da-pos',
    summary: 'Katalog POS sellable yang menggabungkan product dan species.',
    routes: ['products?sellable=true', 'species?sellable=true'],
  },
  {
    id: 'sales',
    area: 'pos',
    label: 'Sales',
    iconKind: 'sales',
    sourceRepo: 'E:\\Projects\\da-pos',
    summary: 'Daftar transaksi, status sale, dan sinkronisasi payment.',
    routes: ['sales', 'orders/:id', 'sales/:id/status'],
  },
  {
    id: 'cashflow',
    area: 'pos',
    label: 'Cashflow',
    iconKind: 'wallet',
    sourceRepo: 'E:\\Projects\\da-pos',
    summary: 'Sesi kasir, preview cash sales, close shift, dan deposit lanjutan.',
    routes: [
      'cashflow',
      'pos/cashflow/active',
      'pos/cashflow/open',
      'pos/cashflow/:id/close',
    ],
  },
  {
    id: 'customer',
    area: 'pos',
    label: 'Customer',
    iconKind: 'people',
    sourceRepo: 'E:\\Projects\\da-pos',
    summary: 'Customer POS dan walk-in buyer untuk transaksi toko.',
    routes: [
      'customers',
      'customer',
      'account/teams',
      'account/settings',
      'activity',
    ],
  },
  {
    id: 'am',
    area: 'am',
    label: 'AM',
    iconKind: 'automation',
    sourceRepo: 'E:\\Projects\\da-automation-management',
    summary:
      'Automation management, workflow otomasi, backend routes, dan dashboard AM.',
    routes: [
      '/',
      'tasks',
      'tasks/:id',
      'hardware',
      'hardware/:rackId',
      'hardware/:rackId/:boxId',
      'hardware/:rackId/:boxId/:deviceId',
      'mutasi',
      'services',
      'transactions',
      'transactions/:id',
      'webhooks',
      'admin/users',
      'admin/activity-log',
      'settings/account',
      'login',
      ':catchAll',
      'api/:path',
      'api/staff-desktop-only',
      'api/auth/session',
      'api/auth/am-access-check',
      'api/auth/emergency-browser',
      'am-be/routes/activity-log',
      'am-be/routes/auth',
      'am-be/routes/box',
      'am-be/routes/chat',
      'am-be/routes/dana',
      'am-be/routes/dashboard',
      'am-be/routes/device',
      'am-be/routes/internal/worker',
      'am-be/routes/mutasi',
      'am-be/routes/rack',
      'am-be/routes/service-account',
      'am-be/routes/task',
      'am-be/routes/transfer',
      'am-be/routes/user',
      'am-be/routes/webhook',
      'automation',
    ],
  },
  {
    id: 'plugins',
    area: 'plugins',
    label: 'Plugin',
    iconKind: 'plugin',
    sourceRepo: 'E:\\Projects',
    summary:
      'Plugin Bantuan, Chat, Dara, Enclosure, Freyer, KPI, Layanan, Proyek, dan Task Manager.',
    routes: [
      'DA-Bantuan-Plugin',
      'DA-Chat-Plugin',
      'DA-Dara-Plugin',
      'DA-Enclosure-Plugin',
      'DA-Freyer-Plugin',
      'DA-KPI-Plugin',
      'DA-Layanan-Plugin',
      'DA-Proyek-Plugin',
      'DA-Task-Manager-Plugin',
    ],
  },
  {
    id: 'preparation',
    area: 'preparation',
    label: 'Preparation',
    iconKind: 'preparation',
    sourceRepo: 'E:\\Projects\\KolamWindows',
    summary:
      'Launcher, source map, route preparation, dan runtime readiness native sebelum screen utama dibangun.',
    routes: [
      'preparation',
      'launch-coverage',
      'source-map',
      'runtime-readiness',
    ],
  },
];

export function getShellModule(moduleId: AppModule): ShellModule {
  const module = shellModules.find(item => item.id === moduleId);

  if (!module) {
    throw new Error(`Unknown shell module: ${moduleId}`);
  }

  return module;
}

export function getShellModulesByArea(area: AppArea): ShellModule[] {
  return shellModules.filter(module => module.area === area);
}

export function getShellAreaCoverage(
  area: AppArea,
  modules = shellModules,
): ShellAreaCoverage {
  const areaModules = modules.filter(module => module.area === area);
  const routeCount = areaModules.reduce(
    (total, module) => total + module.routes.length,
    0,
  );

  return {
    area,
    moduleCount: areaModules.length,
    routeCount,
    summaryLabel: `${areaModules.length} modul / ${routeCount} route`,
  };
}

export function getShellModuleRouteIndex({
  modules = shellModules,
  areas = ['pos', 'am'],
}: {
  modules?: ShellModule[];
  areas?: AppArea[];
} = {}): ShellModuleRouteEntry[] {
  return modules
    .filter(module => areas.includes(module.area))
    .flatMap(module =>
      module.routes.map(route => ({
        id: `${module.id}:${route}`,
        area: module.area,
        moduleId: module.id,
        moduleLabel: module.label,
        route,
        description: module.summary,
        sourceRepo: module.sourceRepo,
      })),
    );
}

export function getShellModuleRouteEntry(
  moduleId: AppModule | undefined,
  route: string | undefined,
  entries = getShellModuleRouteIndex(),
): ShellModuleRouteEntry | null {
  if (!moduleId || !route) {
    return null;
  }

  return (
    entries.find(
      entry => entry.moduleId === moduleId && entry.route === route,
    ) ?? null
  );
}

export function getSidebarBrand(): SidebarBrand {
  return sidebarBrand;
}
