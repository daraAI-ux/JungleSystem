import type {
  CashflowSession,
  CatalogItem,
  SaleSummary,
} from './pos';

export interface UnifiedSurface {
  id: string;
  label: string;
  route: string;
  description: string;
  sourceRepo: string;
}

export interface PluginDescriptor {
  id: string;
  label: string;
  manifestName: string;
  description: string;
  packageName: string;
  packageVersion: string;
  manifestVersion: string;
  entryPoint: string;
  hostMinVersion: string;
  hostSdkVersion: string;
  routes: string[];
  requiresHost: boolean;
  sourceRepo: string;
  capabilities: string[];
  integrationStatus: 'ready' | 'version-mismatch';
}

export interface PluginIntegrationStats {
  total: number;
  ready: number;
  versionMismatch: number;
  routeCount: number;
}

export interface PluginRouteEntry {
  pluginId: string;
  pluginLabel: string;
  manifestName: string;
  route: string;
  sourceRepo: string;
  integrationStatus: PluginDescriptor['integrationStatus'];
}

export interface UnifiedDataSnapshot {
  catalog: CatalogItem[];
  recentSales: SaleSummary[];
  activeSession: CashflowSession | null;
}

export interface UnifiedOverviewMetrics {
  catalogCount: number;
  lowStockCount: number;
  salesCount: number;
  salesValue: number;
  activeSession: boolean;
}

export const kolamSurfaces: UnifiedSurface[] = [
  {
    id: 'inventory',
    label: 'Inventory',
    route: 'products / species',
    description: 'Produk, species, stock transaction, dan data sellable.',
    sourceRepo: 'E:\\Projects\\da-inventory-frontend',
  },
  {
    id: 'finance',
    label: 'Finance',
    route: 'finance / wallet / payable / receivable',
    description: 'Finance, cashflow, wallet, payable, receivable, dan expense.',
    sourceRepo: 'E:\\Projects\\da-inventory-frontend',
  },
  {
    id: 'service',
    label: 'Service',
    route: 'kontrol-layanan / service / vouchers',
    description: 'Kontrol layanan, pending service, voucher, dan task aktif.',
    sourceRepo: 'E:\\Projects\\da-inventory-frontend',
  },
  {
    id: 'projects',
    label: 'Projects',
    route: 'custom-project / production / purchase-order',
    description: 'Proyek custom, production, purchase order, dan permintaan.',
    sourceRepo: 'E:\\Projects\\da-inventory-frontend',
  },
  {
    id: 'storage',
    label: 'Storage',
    route: 'storage-management / storage-history / stock-opname',
    description: 'Storage management, histori penyimpanan, dan stock opname.',
    sourceRepo: 'E:\\Projects\\da-inventory-frontend',
  },
];

export function getKolamSurfaceById(
  surfaceId: string | undefined,
  surfaces = kolamSurfaces,
): UnifiedSurface | null {
  if (!surfaceId) {
    return null;
  }

  return surfaces.find(surface => surface.id === surfaceId) ?? null;
}

export const amSurfaces: UnifiedSurface[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    route: 'am-fe/(dashboard)',
    description: 'Ringkasan operasi automasi dan aktivitas tim.',
    sourceRepo: 'E:\\Projects\\da-automation-management',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    route: 'am-fe/(dashboard)/tasks / am-be/routes/task',
    description: 'Task automation, runner, dan kontrol status pekerjaan.',
    sourceRepo: 'E:\\Projects\\da-automation-management',
  },
  {
    id: 'hardware',
    label: 'Hardware',
    route: 'am-fe/(dashboard)/hardware / am-be/routes/device',
    description: 'Rack, box, device, dan koneksi perangkat automasi.',
    sourceRepo: 'E:\\Projects\\da-automation-management',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    route: 'am-be/routes/webhook / platform-sync',
    description: 'Sinkronisasi marketplace, webhook, dan order ingestion.',
    sourceRepo: 'E:\\Projects\\da-automation-management',
  },
  {
    id: 'operations',
    label: 'Operations',
    route: 'mutasi / services / transactions / activity-log',
    description: 'Mutasi, service account, transaksi, dan audit aktivitas.',
    sourceRepo: 'E:\\Projects\\da-automation-management',
  },
];

export function getAmSurfaceById(
  surfaceId: string | undefined,
  surfaces = amSurfaces,
): UnifiedSurface | null {
  if (!surfaceId) {
    return null;
  }

  return surfaces.find(surface => surface.id === surfaceId) ?? null;
}

export const pluginRegistry: PluginDescriptor[] = [
  {
    id: 'bantuan',
    label: 'Bantuan',
    manifestName: 'Bantuan Kolam',
    description: 'Dokumentasi operasional /bantuan, modul, plugin, AM, dan DARA.',
    packageName: '@dara-ai/da-bantuan-plugin',
    packageVersion: '0.1.1',
    manifestVersion: '0.1.1',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '2.7.0',
    hostSdkVersion: '1.0',
    routes: ['/bantuan', '/bantuan/:slug'],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-Bantuan-Plugin',
    capabilities: ['knowledge base', 'help desk'],
    integrationStatus: 'ready',
  },
  {
    id: 'chat',
    label: 'Chat',
    manifestName: 'Chat & Inbox',
    description:
      'Inbox omnichannel AM, Team Chat internal, label, dan template messaging.',
    packageName: '@dara-ai/da-chat-plugin',
    packageVersion: '0.2.74',
    manifestVersion: '0.2.74',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '2.7.0',
    hostSdkVersion: '1.0',
    routes: [
      '/inbox',
      '/inbox/:id',
      '/inbox/analytics',
      '/inbox/demand-watch',
      '/inbox/settings/labels',
      '/inbox/settings/templates',
      '/team-chat',
    ],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-Chat-Plugin',
    capabilities: ['team chat', 'notifications'],
    integrationStatus: 'ready',
  },
  {
    id: 'dara',
    label: 'Dara',
    manifestName: 'DARA Intelligence',
    description:
      'Campaign SEO, Tax Intelligence, Market Intel, Jobs, dan training DARA.',
    packageName: '@dara-ai/da-dara-plugin',
    packageVersion: '0.1.44',
    manifestVersion: '0.1.45',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '2.7.0',
    hostSdkVersion: '1.0',
    routes: [
      '/pusat-ai',
      '/campaign/dara-marketing',
      '/campaign/dara-jobs',
      '/campaign/dara-seo',
      '/campaign/dara-seo/approvals',
      '/campaign/dara-seo/rankings',
      '/campaign/dara-seo/keywords',
      '/campaign/dara-seo/website',
      '/campaign/dara-seo/mentions',
      '/campaign/dara-seo/sentiment',
      '/campaign/dara-seo/audit-logs',
      '/campaign/dara-seo/integrations',
      '/campaign/dara-seo/social-insights',
      '/campaign/dara-market-intel',
      '/campaign/dara-market-intel/competitors',
      '/campaign/dara-market-intel/approvals',
      '/campaign/dara-market-intel/peralatan',
      '/campaign/dara-market-intel/kesehatan',
      '/finance/tax',
      '/list-of-users/dara-training',
    ],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-Dara-Plugin',
    capabilities: ['AI assistant', 'reasoning'],
    integrationStatus: 'version-mismatch',
  },
  {
    id: 'enclosure',
    label: 'Enclosure',
    manifestName: 'DA-Enclosure-Plugin',
    description:
      'Kelola enclosure, livestock di enclosure, task, jadwal, dan pergerakan stok.',
    packageName: '@dara-ai/da-enclosure-plugin',
    packageVersion: '1.4.58',
    manifestVersion: '1.4.58',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '0.1.0',
    hostSdkVersion: '1.0',
    routes: [
      '/enclosures',
      '/enclosures/:id',
      '/enclosures/:id/edit',
      '/dashboard/enclosures',
      '/dashboard/enclosures/:id',
    ],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-Enclosure-Plugin',
    capabilities: ['enclosure', 'inventory'],
    integrationStatus: 'ready',
  },
  {
    id: 'freyer',
    label: 'Freyer',
    manifestName: 'DA-Freyr-Plugin',
    description:
      'Teranura dan Freyr: katalog, detail, perangkat IoT staff, dan dashboard pelanggan.',
    packageName: '@dara-ai/da-freyer-plugin',
    packageVersion: '1.3.4',
    manifestVersion: '1.3.4',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '0.1.0',
    hostSdkVersion: '1.0',
    routes: [
      '/teranura',
      '/teranura/:id',
      '/teranura/create',
      '/teranura/:id/edit',
      '/dashboard/freyr',
      '/dashboard/freyr/:id',
    ],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-Freyer-Plugin',
    capabilities: ['freyer workflow', 'operations'],
    integrationStatus: 'ready',
  },
  {
    id: 'kpi',
    label: 'KPI',
    manifestName: 'KPI Staff',
    description: 'Ledger poin kinerja, level, leaderboard, dan settings staff.',
    packageName: '@dara-ai/da-kpi-plugin',
    packageVersion: '0.9.10',
    manifestVersion: '0.9.10',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '0.1.0',
    hostSdkVersion: '1.0',
    routes: ['/api/kpi', '/portal/kpi', '/list-of-users/kpi'],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-KPI-Plugin',
    capabilities: ['KPI', 'reporting'],
    integrationStatus: 'ready',
  },
  {
    id: 'layanan',
    label: 'Layanan',
    manifestName: 'DA-Layanan-Plugin',
    description:
      'Layanan langganan customer web store dan admin operasional Kolam.',
    packageName: '@dara-ai/da-layanan-plugin',
    packageVersion: '1.10.17',
    manifestVersion: '1.10.17',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '0.1.0',
    hostSdkVersion: '1.0',
    routes: [
      '/dashboard/services',
      '/dashboard/services/:id',
      '/layanan',
      '/layanan/create',
      '/layanan/:id',
      '/layanan/:id/edit',
      '/layanan/langganan/:id',
      '/layanan/voucher/:id',
      '/layanan/voucher/:id/execution/:executionId',
    ],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-Layanan-Plugin',
    capabilities: ['service', 'voucher'],
    integrationStatus: 'ready',
  },
  {
    id: 'proyek',
    label: 'Proyek',
    manifestName: 'Proyek Kustom',
    description:
      'Quotation, lifecycle, HPP, pembayaran, terms template, dan embed sales/katalog.',
    packageName: '@dara-ai/da-proyek-plugin',
    packageVersion: '0.4.0',
    manifestVersion: '0.4.0',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '0.1.0',
    hostSdkVersion: '1.0',
    routes: [
      '/proyek',
      '/proyek/new',
      '/proyek/:ref',
      '/proyek/:ref/edit',
      '/terms-templates',
      '/terms-templates/new',
      '/terms-templates/:id',
    ],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-Proyek-Plugin',
    capabilities: ['projects', 'custom work'],
    integrationStatus: 'ready',
  },
  {
    id: 'task-manager',
    label: 'Task Manager',
    manifestName: 'DA-Task-Manager-Plugin',
    description:
      'Kelola tugas, tugas terjadwal, kategori, tipe task enclosure, dan integrasi proyek.',
    packageName: '@dara-ai/da-task-manager-plugin',
    packageVersion: '1.0.13',
    manifestVersion: '1.0.13',
    entryPoint: './dist/index.mjs',
    hostMinVersion: '0.1.0',
    hostSdkVersion: '1.0',
    routes: [
      '/task-manager',
      '/task-manager/tugas-terjadwal',
      '/task-manager/:id',
      '/task-manager/settings/categories',
      '/task-manager/settings/task-types',
    ],
    requiresHost: true,
    sourceRepo: 'E:\\Projects\\DA-Task-Manager-Plugin',
    capabilities: ['tasks', 'automation'],
    integrationStatus: 'ready',
  },
];

export function getPluginIntegrationStats(
  plugins: PluginDescriptor[] = pluginRegistry,
): PluginIntegrationStats {
  return {
    total: plugins.length,
    ready: plugins.filter(plugin => plugin.integrationStatus === 'ready')
      .length,
    versionMismatch: plugins.filter(
      plugin => plugin.integrationStatus === 'version-mismatch',
    ).length,
    routeCount: plugins.reduce(
      (total, plugin) => total + plugin.routes.length,
      0,
    ),
  };
}

export function getPluginRouteIndex(
  plugins: PluginDescriptor[] = pluginRegistry,
): PluginRouteEntry[] {
  return plugins.flatMap(plugin =>
    plugin.routes.map(route => ({
      pluginId: plugin.id,
      pluginLabel: plugin.label,
      manifestName: plugin.manifestName,
      route,
      sourceRepo: plugin.sourceRepo,
      integrationStatus: plugin.integrationStatus,
    })),
  );
}

export function filterPluginRegistry(
  plugins: PluginDescriptor[],
  query: string,
): PluginDescriptor[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return plugins;
  }

  return plugins.filter(plugin => {
    const searchableText = [
      plugin.id,
      plugin.label,
      plugin.manifestName,
      plugin.description,
      plugin.packageName,
      plugin.packageVersion,
      plugin.manifestVersion,
      plugin.entryPoint,
      plugin.hostMinVersion,
      plugin.hostSdkVersion,
      plugin.integrationStatus,
      plugin.sourceRepo,
      ...plugin.capabilities,
      ...plugin.routes,
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

export function getUnifiedOverviewMetrics(
  snapshot: UnifiedDataSnapshot,
): UnifiedOverviewMetrics {
  const activeSales = snapshot.recentSales.filter(
    sale => sale.status !== 'cancelled',
  );

  return {
    catalogCount: snapshot.catalog.length,
    lowStockCount: snapshot.catalog.filter(
      item => item.stock <= item.lowStockThreshold,
    ).length,
    salesCount: activeSales.length,
    salesValue: activeSales.reduce((total, sale) => total + sale.total, 0),
    activeSession: Boolean(snapshot.activeSession),
  };
}
