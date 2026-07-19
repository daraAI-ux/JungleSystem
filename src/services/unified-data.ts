import {
  getAmDashboard,
  type AmDashboardData,
} from './am-api';
import {
  getKolamDashboard,
  getKolamFinanceSummary,
  getKolamPendingCustomerVerifications,
  getKolamSaleCostSummary,
  type KolamDashboardActionRequired,
  type KolamDashboardCounts,
  type KolamDashboardLatest,
  type KolamDashboardSummary,
  type KolamFinanceSummary,
  type KolamPendingCustomerVerificationRow,
  type KolamSaleCostSummary,
  type KolamSalesGraphPoint,
  type KolamSummaryRange,
} from './kolam-api';
import {loadPosDataset, seedDataset, type PosDataset} from './pos-data';
import {appConfig} from '../config/app';
import type {AccessScope} from '../domain/auth';
import {getErrorMessage} from '../lib/api-error';

export type UnifiedSourceState =
  | 'seed'
  | 'cache'
  | 'live'
  | 'fallback'
  | 'disabled';
export type KolamDashboardRange = Extract<
  KolamSummaryRange,
  'week' | 'month' | 'year' | 'all'
>;

export interface KolamDatasetState {
  source: UnifiedSourceState;
  dashboardRange: KolamDashboardRange;
  financeSummary: KolamFinanceSummary | null;
  saleCostSummary: KolamSaleCostSummary | null;
  dashboardSummary: KolamDashboardSummary[];
  dashboardLatest: KolamDashboardLatest | null;
  dashboardCounts: KolamDashboardCounts | null;
  dashboardActionRequired: KolamDashboardActionRequired | null;
  salesGraph: KolamSalesGraphPoint[];
  pendingCustomerVerifications: KolamPendingCustomerVerificationRow[];
  errorMessage?: string;
}

export interface AmDatasetState {
  source: UnifiedSourceState;
  dashboard: AmDashboardData | null;
  baseUrl?: string;
  errorMessage?: string;
}

export interface UnifiedDataset extends PosDataset {
  kolam: KolamDatasetState;
  am: AmDatasetState;
  sync: UnifiedSyncStatus;
}

export interface UnifiedSyncStatus {
  pos: UnifiedSourceState;
  kolam: UnifiedSourceState;
  am: UnifiedSourceState;
}

export const seedUnifiedDataset: UnifiedDataset = {
  ...seedDataset,
  kolam: {
    source: 'seed',
    dashboardRange: 'month',
    financeSummary: null,
    saleCostSummary: null,
    dashboardSummary: [],
    dashboardLatest: null,
    dashboardCounts: null,
    dashboardActionRequired: null,
    salesGraph: [],
    pendingCustomerVerifications: [
      {
        pendingServiceId: 'pending-service-aquarium-care',
        serviceSerial: 'SV-20260711-001',
        subscriptionId: 'subscription-aquarium-care',
        subscriptionNumber: 'SUB-2026-0001',
        taskKind: 'maintenance',
        taskId: 'maintenance-visit-1',
        executionId: 'execution-visit-1',
        visitTitle: 'Kunjungan layanan',
        packageTaskCode: 'VISIT-1',
        scheduledTime: '2026-07-11T09:00:00.000+07:00',
        supervisorVerifiedAt: '2026-07-11T10:30:00.000+07:00',
        status: 'done',
      },
    ],
  },
  am: {
    source: 'disabled',
    dashboard: null,
    errorMessage: 'URL server AM existing belum dikonfigurasi.',
  },
  sync: {
    pos: 'seed',
    kolam: 'seed',
    am: 'disabled',
  },
};

export async function loadUnifiedDataset(
  options: {
    preferLiveApi?: boolean;
    amApiBaseUrl?: string;
    enabledAreas?: Partial<AccessScope>;
    kolamDashboardRange?: KolamDashboardRange;
  } = {},
): Promise<UnifiedDataset> {
  const preferLiveApi = options.preferLiveApi ?? appConfig.preferLiveApi;
  const kolamDashboardRange = options.kolamDashboardRange ?? 'month';
  const amApiBaseUrl = normalizeBaseUrl(options.amApiBaseUrl);
  const canLoadPos = isAreaEnabled(options.enabledAreas, 'pos');
  const canLoadKolam = isAreaEnabled(options.enabledAreas, 'kolam');
  const canLoadAm = isAreaEnabled(options.enabledAreas, 'am');
  const posDataset = await loadPosDataset({
    preferLiveApi: preferLiveApi && canLoadPos,
  });
  const posSyncSource = getPosSyncSource(posDataset, preferLiveApi, canLoadPos);

  if (!preferLiveApi) {
    return {
      ...seedUnifiedDataset,
      ...posDataset,
      kolam: {
        ...seedUnifiedDataset.kolam,
        dashboardRange: kolamDashboardRange,
      },
      sync: {
        pos: posSyncSource,
        kolam: 'seed',
        am: 'disabled',
      },
    };
  }

  const [kolam, am] = await Promise.all([
    canLoadKolam
      ? loadKolamState(kolamDashboardRange)
      : Promise.resolve(disabledKolamState(kolamDashboardRange)),
    canLoadAm ? loadAmState(amApiBaseUrl) : Promise.resolve(disabledAmState()),
  ]);

  return {
    ...posDataset,
    kolam,
    am,
    sync: {
      pos: posSyncSource,
      kolam: kolam.source,
      am: am.source,
    },
  };
}

function disabledKolamState(
  dashboardRange: KolamDashboardRange = 'month',
): KolamDatasetState {
  return {
    ...seedUnifiedDataset.kolam,
    dashboardRange,
    source: 'disabled',
    errorMessage: 'Kolam live tidak dicoba karena sesi tidak punya akses Kolam.',
  };
}

function disabledAmState(): AmDatasetState {
  return {
    source: 'disabled',
    dashboard: null,
    errorMessage:
      'AM live tidak dicoba karena sesi tidak punya akses AM atau URL server existing belum diset.',
  };
}

async function loadKolamState(
  dashboardRange: KolamDashboardRange,
): Promise<KolamDatasetState> {
  try {
    const [
      financeSummary,
      saleCostSummary,
      dashboard,
      pendingCustomerVerifications,
    ] = await Promise.all([
      getKolamFinanceSummary({range: 'month'}),
      getKolamSaleCostSummary({range: 'month'}),
      getKolamDashboard(dashboardRange),
      getKolamPendingCustomerVerifications().catch(() => []),
    ]);

    return {
      source: 'live',
      dashboardRange,
      financeSummary,
      saleCostSummary,
      dashboardSummary: dashboard.summary ?? [],
      dashboardLatest: dashboard.latest ?? null,
      dashboardCounts: dashboard.counts,
      dashboardActionRequired: dashboard.actionRequired ?? null,
      salesGraph: dashboard.salesGraph.data,
      pendingCustomerVerifications,
    };
  } catch (error) {
    return {
      ...seedUnifiedDataset.kolam,
      dashboardRange,
      source: 'fallback',
      errorMessage: getErrorMessage(error),
    };
  }
}

async function loadAmState(baseUrl: string): Promise<AmDatasetState> {
  if (!baseUrl) {
    return seedUnifiedDataset.am;
  }

  try {
    return {
      source: 'live',
      baseUrl,
      dashboard: await getAmDashboard(baseUrl),
    };
  } catch (error) {
    return {
      source: 'fallback',
      dashboard: null,
      errorMessage: getErrorMessage(error),
    };
  }
}

function normalizeBaseUrl(baseUrl?: string) {
  return (baseUrl ?? appConfig.amApiBaseUrl).trim().replace(/\/$/, '');
}

function getPosSyncSource(
  dataset: PosDataset,
  preferLiveApi: boolean,
  canLoadPos: boolean,
): UnifiedSourceState {
  if (preferLiveApi && !canLoadPos) {
    return 'disabled';
  }

  if (preferLiveApi && dataset.errorMessage) {
    return 'fallback';
  }

  return dataset.source;
}

function isAreaEnabled(
  enabledAreas: Partial<AccessScope> | undefined,
  area: keyof AccessScope,
) {
  return enabledAreas?.[area] ?? true;
}

export function getUnifiedSyncMessage(dataset: UnifiedDataset): string {
  return `Sync: POS ${dataset.sync.pos}, Kolam ${dataset.sync.kolam}, AM ${dataset.sync.am}.`;
}

