import type {AccessScope} from './auth';
import type {AppArea, AppModule} from './app-shell';

export type RuntimeAccessRequirement = 'kolam' | 'pos' | 'am' | 'any';

export type RuntimeActionStatus =
  | 'native-ready'
  | 'live-api'
  | 'source-audit'
  | 'planned';

export type RuntimeActionStatusIconKind =
  | 'check'
  | 'activity'
  | 'search'
  | 'clock';

export interface RuntimeAction {
  id: string;
  moduleId: AppModule;
  area: AppArea;
  label: string;
  description: string;
  sourceContract: string;
  requiredAccess: RuntimeAccessRequirement;
  status: RuntimeActionStatus;
  statusIconKind: RuntimeActionStatusIconKind;
}

export interface RuntimeActionStats {
  total: number;
  enabled: number;
  blocked: number;
  liveApi: number;
  nativeReady: number;
}

export const runtimeActions: RuntimeAction[] = [
  {
    id: 'kolam-sync-finance',
    moduleId: 'kolam',
    area: 'kolam',
    label: 'Sync finance',
    description: 'Muat finance summary, sale cost, wallet, dan sales graph Kolam.',
    sourceContract: 'GET /finance-summary + /finance-summary/sale-cost',
    requiredAccess: 'kolam',
    status: 'live-api',
    statusIconKind: 'activity',
  },
  {
    id: 'kolam-review-operations',
    moduleId: 'kolam',
    area: 'kolam',
    label: 'Review operations',
    description: 'Pantau inventory, service, projects, storage, dan stock opname.',
    sourceContract: 'da-inventory-frontend routes',
    requiredAccess: 'kolam',
    status: 'source-audit',
    statusIconKind: 'search',
  },
  {
    id: 'kolam-review-settings',
    moduleId: 'settings',
    area: 'kolam',
    label: 'Review settings',
    description:
      'Buka ringkasan Web Settings, Role Management, dan Activity Log Kolam.',
    sourceContract: 'da-inventory-frontend settings routes',
    requiredAccess: 'kolam',
    status: 'source-audit',
    statusIconKind: 'search',
  },
  {
    id: 'pos-search-catalog',
    moduleId: 'catalog',
    area: 'pos',
    label: 'Search sellable catalog',
    description: 'Cari product/species sellable dari dataset POS aktif.',
    sourceContract: 'GET /products?sellable=true + /species?sellable=true',
    requiredAccess: 'pos',
    status: 'native-ready',
    statusIconKind: 'check',
  },
  {
    id: 'pos-create-sale-draft',
    moduleId: 'checkout',
    area: 'pos',
    label: 'Create sale draft',
    description: 'Buat sale draft dengan cart, customer, payment, dan cashflow open.',
    sourceContract: 'POST /sales channel=pos',
    requiredAccess: 'pos',
    status: 'live-api',
    statusIconKind: 'activity',
  },
  {
    id: 'pos-open-cashflow',
    moduleId: 'cashflow',
    area: 'pos',
    label: 'Open cashflow',
    description: 'Buka sesi kasir native sebelum transaksi checkout.',
    sourceContract: 'POST /pos/cashflow/open',
    requiredAccess: 'pos',
    status: 'live-api',
    statusIconKind: 'activity',
  },
  {
    id: 'pos-close-cashflow',
    moduleId: 'cashflow',
    area: 'pos',
    label: 'Close cashflow',
    description: 'Tutup sesi kasir dengan preview deposit dari backend POS.',
    sourceContract: 'POST /pos/cashflow/:id/close',
    requiredAccess: 'pos',
    status: 'live-api',
    statusIconKind: 'activity',
  },
  {
    id: 'pos-create-customer',
    moduleId: 'customer',
    area: 'pos',
    label: 'Create customer',
    description: 'Buat customer POS dan pilih langsung untuk checkout.',
    sourceContract: 'POST /customer',
    requiredAccess: 'pos',
    status: 'live-api',
    statusIconKind: 'activity',
  },
  {
    id: 'pos-update-sale-status',
    moduleId: 'sales',
    area: 'pos',
    label: 'Update sale status',
    description: 'Gerakkan status sale draft, sent, paid, atau cancelled.',
    sourceContract: 'PUT /sales/:id/status',
    requiredAccess: 'pos',
    status: 'live-api',
    statusIconKind: 'activity',
  },
  {
    id: 'am-sync-dashboard',
    moduleId: 'am',
    area: 'am',
    label: 'Sync AM dashboard',
    description: 'Muat summary balance, transfer, mutasi, dan device AM.',
    sourceContract: 'GET /dashboard',
    requiredAccess: 'am',
    status: 'live-api',
    statusIconKind: 'activity',
  },
  {
    id: 'am-review-hardware',
    moduleId: 'am',
    area: 'am',
    label: 'Review hardware',
    description: 'Pantau device, rack, box, dan account automation.',
    sourceContract: 'am-fe hardware + am-be device routes',
    requiredAccess: 'am',
    status: 'source-audit',
    statusIconKind: 'search',
  },
  {
    id: 'plugin-route-explorer',
    moduleId: 'plugins',
    area: 'plugins',
    label: 'Explore plugin routes',
    description: 'Telusuri 64 route host dari manifest plugin resmi DA.',
    sourceContract: 'DA-*-Plugin src/manifest.ts',
    requiredAccess: 'kolam',
    status: 'native-ready',
    statusIconKind: 'check',
  },
  {
    id: 'plugin-version-audit',
    moduleId: 'plugins',
    area: 'plugins',
    label: 'Audit plugin versions',
    description: 'Tandai package/manifest mismatch seperti DARA 0.1.44/0.1.45.',
    sourceContract: 'package.json + src/manifest.ts',
    requiredAccess: 'kolam',
    status: 'source-audit',
    statusIconKind: 'search',
  },
  {
    id: 'preparation-runtime-audit',
    moduleId: 'preparation',
    area: 'preparation',
    label: 'Audit preparation',
    description:
      'Periksa launch coverage, source map, dan runtime readiness sebelum screen dipromosikan ke dashboard.',
    sourceContract: 'KolamWindows preparation surface',
    requiredAccess: 'kolam',
    status: 'source-audit',
    statusIconKind: 'search',
  },
];

export function getRuntimeActionsByModule(
  moduleId: AppModule,
  actions: RuntimeAction[] = runtimeActions,
): RuntimeAction[] {
  return actions.filter(action => action.moduleId === moduleId);
}

export function isRuntimeActionEnabled(
  action: RuntimeAction,
  scope: AccessScope,
): boolean {
  if (action.requiredAccess === 'any') {
    return scope.kolam || scope.pos || scope.am;
  }

  return scope[action.requiredAccess];
}

export function getRuntimeActionStats(
  scope: AccessScope,
  actions: RuntimeAction[] = runtimeActions,
): RuntimeActionStats {
  const enabled = actions.filter(action =>
    isRuntimeActionEnabled(action, scope),
  ).length;

  return {
    total: actions.length,
    enabled,
    blocked: actions.length - enabled,
    liveApi: actions.filter(action => action.status === 'live-api').length,
    nativeReady: actions.filter(action => action.status === 'native-ready')
      .length,
  };
}
