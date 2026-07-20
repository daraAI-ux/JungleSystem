import { getShellModule, type AppModule } from './app-shell';
import type { AccessScope } from './auth';
import type { ShellModuleRouteEntry } from './app-shell';
import type { KolamNavigationItem } from './kolam-navigation';
import type { KolamButtonIntent, KolamButtonTone } from './kolam-button';
import type { SyncActivityArea } from './sync-activity';
import { getSyncStatusIconKind } from './sync-activity';
import type { PluginRouteEntry, UnifiedSurface } from './unified';
import type {
  UnifiedDataset,
  UnifiedSourceState,
} from '../services/unified-data';

export type DashboardHeaderRequiredArea = 'kolam' | 'pos';

export interface DashboardHeaderAction {
  id: 'new-product' | 'new-order';
  label: string;
  iconKind: 'package' | 'plus';
  intent: KolamButtonIntent;
  buttonTone: KolamButtonTone;
  requiredArea: DashboardHeaderRequiredArea;
  targetModule: AppModule;
  sourceRoute: string;
  accessibilityLabel: string;
}

export interface DashboardHeaderRouteContext {
  eyebrow: string;
  route: string;
  subtitle: string;
  title: string;
}

export interface DashboardHeaderSyncIndicator {
  area: SyncActivityArea | 'app';
  areaLabel: string;
  detail: string;
  intent: 'success' | 'warning' | 'muted';
  label: string;
  status: UnifiedSourceState;
  statusIconKind: ReturnType<typeof getSyncStatusIconKind>;
}

export interface DashboardHeaderRouteContextInput {
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
}

export interface DashboardHeaderVisualContract {
  sourceComponent: string;
  layout: {
    gap: number;
    minHeight: number;
    paddingTop: number;
    paddingBottom: number;
    alignItems: 'flex-end';
  };
  eyebrow: {
    fontSize: number;
    marginBottom: number;
    fontWeight: 'bold';
    letterSpacing: number;
    textTransform: 'uppercase';
  };
  title: {
    fontSize: number;
    lineHeight: number;
    fontWeight: 'bold';
    trackingSource: 'dashboard-exact-title';
    appliedLetterSpacing: 0;
  };
  description: {
    fontSize: number;
    marginTop: number;
  };
  actions: {
    gapX: number;
    alignItems: 'center';
    justifyContent: 'flex-end';
    flexWrap: 'wrap';
    flexShrink: 0;
    buttonTone: 'positive';
    sourceClass: 'kolam-positive-action';
  };
  sessionPill: {
    visibleOnBeranda: boolean;
    nativeOnly: true;
    minWidth: number;
    padding: number;
    radius: number;
    borderWidth: number;
    labelFontSize: number;
    valueGapY: number;
    valueFontSize: number;
  };
}

const dashboardHeaderVisualContract: DashboardHeaderVisualContract = {
  sourceComponent:
    'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\header.tsx',
  layout: {
    gap: 24,
    minHeight: 64,
    paddingTop: 10,
    paddingBottom: 4,
    alignItems: 'flex-end',
  },
  eyebrow: {
    fontSize: 11,
    marginBottom: 7,
    fontWeight: 'bold',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    lineHeight: 25,
    fontWeight: 'bold',
    trackingSource: 'dashboard-exact-title',
    appliedLetterSpacing: 0,
  },
  description: {
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    gapX: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    flexShrink: 0,
    buttonTone: 'positive',
    sourceClass: 'kolam-positive-action',
  },
  sessionPill: {
    visibleOnBeranda: true,
    nativeOnly: true,
    minWidth: 190,
    padding: 10,
    radius: 8,
    borderWidth: 1,
    labelFontSize: 12,
    valueGapY: 3,
    valueFontSize: 14,
  },
};

const DASHBOARD_TIMEZONE_PATTERN = /^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/;

const syncStatusLabels: Record<UnifiedSourceState, string> = {
  cache: 'Cache',
  disabled: 'Disabled',
  fallback: 'Fallback',
  live: 'Live',
  seed: 'Seed',
};

const syncAreaLabels: Record<SyncActivityArea | 'app', string> = {
  am: 'AM',
  app: 'App',
  kolam: 'Kolam',
  pos: 'POS',
};

function getDashboardTimezoneOffsetMinutes(
  timezone: string | undefined,
): number {
  const match = timezone?.match(DASHBOARD_TIMEZONE_PATTERN);
  const [, signValue = '+', hours = '0', minutes = '00'] = match ?? [];
  const sign = signValue === '+' ? 1 : -1;

  return (
    sign * (Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes, 10))
  );
}

export function getDashboardGreeting(
  date = new Date(),
  timezone?: string,
): string {
  const offsetMinutes = getDashboardTimezoneOffsetMinutes(timezone);
  const hour = new Date(date.getTime() + offsetMinutes * 60_000).getUTCHours();

  if (hour < 12) {
    return 'Selamat pagi';
  }

  if (hour < 17) {
    return 'Selamat siang';
  }

  if (hour < 19) {
    return 'Selamat sore';
  }

  return 'Selamat malam';
}

export function getDashboardSubtitle(moduleLabel: string): string {
  return moduleLabel === 'Kolam'
    ? 'Ringkasan performa toko hari ini: penjualan, stok, dan pesanan tertunda.'
    : `${moduleLabel} workspace native Windows.`;
}

export function getDashboardHeaderRouteContext({
  activeAmSurface,
  activeKolamSurface,
  activeModuleRoute,
  activeNavigationItem,
  activePluginRoute,
}: DashboardHeaderRouteContextInput): DashboardHeaderRouteContext | null {
  if (activeModuleRoute) {
    return {
      eyebrow: `${activeModuleRoute.area.toUpperCase()} Route`,
      route: activeModuleRoute.route,
      title: activeModuleRoute.route,
      subtitle: '',
    };
  }

  if (activePluginRoute) {
    return {
      eyebrow: 'Plugin Route',
      route: activePluginRoute.route,
      title: `${activePluginRoute.pluginLabel} ${activePluginRoute.route}`,
      subtitle: '',
    };
  }

  if (activeAmSurface) {
    return {
      eyebrow: 'AM Surface',
      route: activeAmSurface.route,
      title: activeAmSurface.label,
      subtitle: '',
    };
  }

  if (activeKolamSurface) {
    return {
      eyebrow: 'Kolam Surface',
      route: activeKolamSurface.route,
      title: activeKolamSurface.label,
      subtitle: '',
    };
  }

  if (activeNavigationItem && activeNavigationItem.route !== '/') {
    return {
      eyebrow: activeNavigationItem.group ?? 'Kolam Route',
      route: activeNavigationItem.route,
      title: getDashboardRouteTitle(activeNavigationItem),
      subtitle: '',
    };
  }

  return null;
}

function getDashboardRouteTitle(item: KolamNavigationItem) {
  const routePath = item.route.split('?')[0];
  const brandDetail = routePath.match(
    /^\/label-dan-field\/merek\/([^/]+)(?:\/edit)?$/,
  );
  const categoryDetail = routePath.match(
    /^\/label-dan-field\/kategori\/([^/]+)(?:\/edit)?$/,
  );
  const tagDetail = routePath.match(/^\/tags\/([^/]+)(?:\/edit)?$/);
  const customFieldDetail = routePath.match(
    /^\/custom-fields\/([^/]+)(?:\/edit)?$/,
  );
  const unitDetail = routePath.match(/^\/units\/([^/]+)(?:\/edit)?$/);

  if (brandDetail?.[1] && brandDetail[1] !== 'baru') {
    return decodeURIComponent(brandDetail[1]).replace(/-/g, ' ');
  }

  if (categoryDetail?.[1] && categoryDetail[1] !== 'baru') {
    return decodeURIComponent(categoryDetail[1]).replace(/-/g, ' ');
  }

  if (tagDetail?.[1] && tagDetail[1] !== 'baru') {
    return decodeURIComponent(tagDetail[1]).replace(/-/g, ' ');
  }

  if (customFieldDetail?.[1] && customFieldDetail[1] !== 'baru') {
    return decodeURIComponent(customFieldDetail[1]).replace(/-/g, ' ');
  }

  if (unitDetail?.[1] && unitDetail[1] !== 'baru') {
    return decodeURIComponent(unitDetail[1]).replace(/-/g, ' ');
  }

  return item.label;
}

export function getDashboardTitle(
  displayName: string,
  date = new Date(),
  timezone?: string,
): string {
  const greeting = getDashboardGreeting(date, timezone);
  const trimmedName = displayName.trim();

  return trimmedName ? `${greeting}, ${trimmedName}` : greeting;
}

export function shouldShowDashboardSessionPill(eyebrow?: string): boolean {
  return eyebrow === 'Beranda';
}

export function getDashboardHeaderSyncIndicator({
  activeModule,
  dataset,
}: {
  activeModule: AppModule;
  dataset: UnifiedDataset;
}): DashboardHeaderSyncIndicator {
  const area = getDashboardHeaderSyncArea(activeModule);
  const status =
    area === 'app'
      ? getCompositeDashboardHeaderSyncStatus(dataset)
      : dataset.sync[area];
  const areaLabel = syncAreaLabels[area];

  return {
    area,
    areaLabel,
    detail: `${areaLabel} data source: ${syncStatusLabels[status]}`,
    intent: getDashboardHeaderSyncIntent(status),
    label: syncStatusLabels[status],
    status,
    statusIconKind: getSyncStatusIconKind(status),
  };
}

function getDashboardHeaderSyncArea(
  activeModule: AppModule,
): SyncActivityArea | 'app' {
  const area = getShellModule(activeModule).area;

  if (area === 'kolam' || area === 'pos' || area === 'am') {
    return area;
  }

  return 'app';
}

function getCompositeDashboardHeaderSyncStatus(
  dataset: UnifiedDataset,
): UnifiedSourceState {
  const statuses = [dataset.sync.kolam, dataset.sync.pos, dataset.sync.am];

  if (statuses.includes('live')) {
    return 'live';
  }

  if (statuses.includes('cache')) {
    return 'cache';
  }

  if (statuses.includes('fallback')) {
    return 'fallback';
  }

  if (statuses.includes('seed')) {
    return 'seed';
  }

  return 'disabled';
}

function getDashboardHeaderSyncIntent(
  status: UnifiedSourceState,
): DashboardHeaderSyncIndicator['intent'] {
  if (status === 'live' || status === 'cache') {
    return 'success';
  }

  if (status === 'fallback') {
    return 'warning';
  }

  return 'muted';
}

export function getDashboardHeaderActions(
  accessScope?: Pick<AccessScope, 'kolam' | 'pos'>,
): DashboardHeaderAction[] {
  const actions: DashboardHeaderAction[] = [
    {
      id: 'new-product',
      label: 'Produk Baru',
      iconKind: 'package',
      intent: 'outline',
      buttonTone: 'positive',
      requiredArea: 'kolam',
      targetModule: 'catalog',
      sourceRoute: '/products/create',
      accessibilityLabel: 'Produk Baru - /products/create',
    },
    {
      id: 'new-order',
      label: 'Order Baru',
      iconKind: 'plus',
      intent: 'primary',
      buttonTone: 'positive',
      requiredArea: 'pos',
      targetModule: 'checkout',
      sourceRoute: '/sales/create',
      accessibilityLabel: 'Order Baru - /sales/create',
    },
  ];

  if (!accessScope) {
    return actions;
  }

  return actions.filter(action => Boolean(accessScope[action.requiredArea]));
}

export function getDashboardHeaderVisualContract(): DashboardHeaderVisualContract {
  return {
    ...dashboardHeaderVisualContract,
    layout: { ...dashboardHeaderVisualContract.layout },
    eyebrow: { ...dashboardHeaderVisualContract.eyebrow },
    title: { ...dashboardHeaderVisualContract.title },
    description: { ...dashboardHeaderVisualContract.description },
    actions: { ...dashboardHeaderVisualContract.actions },
    sessionPill: { ...dashboardHeaderVisualContract.sessionPill },
  };
}

export function getDashboardInitials(displayName: string): string {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  return initials || 'K';
}
