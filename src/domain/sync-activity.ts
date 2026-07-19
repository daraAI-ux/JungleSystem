import type {
  UnifiedDataset,
  UnifiedSourceState,
} from '../services/unified-data';

export type SyncActivityArea = 'pos' | 'kolam' | 'am';
export type SyncActivityTone = 'success' | 'warning' | 'muted';
export type SyncActivityStatusIconKind =
  | 'check'
  | 'activity'
  | 'clock'
  | 'seed';

export interface SyncActivityEntry {
  id: string;
  area: SyncActivityArea;
  label: string;
  status: UnifiedSourceState;
  tone: SyncActivityTone;
  statusIconKind: SyncActivityStatusIconKind;
  detail: string;
  timestamp: string;
}

export interface SyncActivitySummary {
  total: number;
  cache: number;
  live: number;
  fallback: number;
  disabled: number;
  seed: number;
}

const areaLabels: Record<SyncActivityArea, string> = {
  pos: 'POS',
  kolam: 'Kolam',
  am: 'AM',
};

export function getSyncActivityEntries(
  dataset: UnifiedDataset,
  timestamp = new Date().toLocaleTimeString(),
): SyncActivityEntry[] {
  return (['pos', 'kolam', 'am'] as const).map(area => {
    const status = dataset.sync[area];

    return {
      id: `${timestamp}:${area}:${status}`,
      area,
      label: areaLabels[area],
      status,
      tone: getSyncTone(status),
      statusIconKind: getSyncStatusIconKind(status),
      detail: getSyncDetail(dataset, area, status),
      timestamp,
    };
  });
}

export function appendSyncActivity(
  current: SyncActivityEntry[],
  dataset: UnifiedDataset,
  timestamp?: string,
  limit = 12,
): SyncActivityEntry[] {
  return [...getSyncActivityEntries(dataset, timestamp), ...current].slice(
    0,
    limit,
  );
}

export function getSyncActivitySummary(
  entries: SyncActivityEntry[],
): SyncActivitySummary {
  return {
    total: entries.length,
    cache: entries.filter(entry => entry.status === 'cache').length,
    live: entries.filter(entry => entry.status === 'live').length,
    fallback: entries.filter(entry => entry.status === 'fallback').length,
    disabled: entries.filter(entry => entry.status === 'disabled').length,
    seed: entries.filter(entry => entry.status === 'seed').length,
  };
}

function getSyncTone(status: UnifiedSourceState): SyncActivityTone {
  if (status === 'live' || status === 'cache') {
    return 'success';
  }

  if (status === 'fallback') {
    return 'warning';
  }

  return 'muted';
}

export function getSyncStatusIconKind(
  status: UnifiedSourceState,
): SyncActivityStatusIconKind {
  if (status === 'live' || status === 'cache') {
    return 'check';
  }

  if (status === 'fallback') {
    return 'activity';
  }

  if (status === 'seed') {
    return 'seed';
  }

  return 'clock';
}

function getSyncDetail(
  dataset: UnifiedDataset,
  area: SyncActivityArea,
  status: UnifiedSourceState,
) {
  if (area === 'pos') {
    return dataset.errorMessage
      ? `POS ${status}: ${dataset.errorMessage}`
      : `POS ${status}: ${dataset.catalog.length} item katalog, ${dataset.recentSales.length} sale.`;
  }

  if (area === 'kolam') {
    return dataset.kolam.errorMessage
      ? `Kolam ${status}: ${dataset.kolam.errorMessage}`
      : `Kolam ${status}: ${dataset.kolam.salesGraph.length} titik sales graph.`;
  }

  return dataset.am.errorMessage
    ? `AM ${status}: ${dataset.am.errorMessage}`
    : `AM ${status}: ${dataset.am.dashboard ? 'dashboard tersedia' : 'dashboard belum tersedia'}.`;
}
