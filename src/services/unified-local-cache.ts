import type {AccessScope} from '../domain/auth';
import {
  loadUnifiedDataset,
  type KolamDashboardRange,
  type UnifiedDataset,
  type UnifiedSourceState,
} from './unified-data';
import {getLocalDataStore, type LocalDataRecord} from './local-data-store';

export interface UnifiedCacheInput {
  cacheOwnerId?: string;
  kolamDashboardRange?: KolamDashboardRange;
}

export interface RefreshUnifiedDatasetWithCacheInput extends UnifiedCacheInput {
  preferLiveApi: boolean;
  amApiBaseUrl?: string;
  enabledAreas?: Partial<AccessScope>;
}

export interface UnifiedDatasetCacheMetadata {
  key: string;
  ownerId: string;
  revision: string;
  updatedAt: string;
  sourceSummary: UnifiedDataset['sync'];
}

export interface UnifiedDatasetRefreshResult {
  dataset: UnifiedDataset;
  changed: boolean;
  metadata: UnifiedDatasetCacheMetadata | null;
}

export async function loadCachedUnifiedDataset({
  cacheOwnerId,
  kolamDashboardRange = 'month',
}: UnifiedCacheInput): Promise<UnifiedDataset | null> {
  const key = getUnifiedDatasetCacheKey(cacheOwnerId, kolamDashboardRange);

  if (!key) {
    return null;
  }

  const record = await getLocalDataStore().read<UnifiedDataset>(key);

  return record ? markUnifiedDatasetAsCache(record.value) : null;
}

export async function refreshUnifiedDatasetWithCache({
  cacheOwnerId,
  kolamDashboardRange = 'month',
  ...options
}: RefreshUnifiedDatasetWithCacheInput): Promise<UnifiedDatasetRefreshResult> {
  const dataset = await loadUnifiedDataset({
    ...options,
    kolamDashboardRange,
  });
  const metadata = await persistUnifiedDatasetIfChanged({
    cacheOwnerId,
    dataset,
    kolamDashboardRange,
  });

  return {
    dataset,
    changed: metadata?.changed ?? false,
    metadata: metadata?.metadata ?? null,
  };
}

export async function persistUnifiedDatasetIfChanged({
  cacheOwnerId,
  dataset,
  kolamDashboardRange = dataset.kolam.dashboardRange,
}: {
  cacheOwnerId?: string;
  dataset: UnifiedDataset;
  kolamDashboardRange?: KolamDashboardRange;
}): Promise<{
  changed: boolean;
  metadata: UnifiedDatasetCacheMetadata;
} | null> {
  const ownerId = normalizeCacheOwnerId(cacheOwnerId);
  const key = getUnifiedDatasetCacheKey(ownerId, kolamDashboardRange);

  if (!ownerId || !key || !shouldPersistUnifiedDataset(dataset)) {
    return null;
  }

  const revision = getStableRevision(dataset);
  const existing = await getLocalDataStore().read<UnifiedDataset>(key);
  const changed = existing?.revision !== revision;
  const updatedAt = changed
    ? new Date().toISOString()
    : existing?.updatedAt ?? new Date().toISOString();
  const metadata: UnifiedDatasetCacheMetadata = {
    key,
    ownerId,
    revision,
    updatedAt,
    sourceSummary: dataset.sync,
  };

  if (changed) {
    await getLocalDataStore().write<UnifiedDataset>({
      key,
      value: dataset,
      revision,
      updatedAt,
    });
  }

  return {changed, metadata};
}

export function getUnifiedDatasetCacheMetadata(
  record: LocalDataRecord<UnifiedDataset>,
  ownerId: string,
): UnifiedDatasetCacheMetadata {
  return {
    key: record.key,
    ownerId,
    revision: record.revision,
    updatedAt: record.updatedAt,
    sourceSummary: record.value.sync,
  };
}

export function getUnifiedDatasetCacheKey(
  cacheOwnerId?: string,
  kolamDashboardRange: KolamDashboardRange = 'month',
) {
  const ownerId = normalizeCacheOwnerId(cacheOwnerId);

  return ownerId ? `unified:${ownerId}:dashboard:${kolamDashboardRange}` : null;
}

export function markUnifiedDatasetAsCache(
  dataset: UnifiedDataset,
): UnifiedDataset {
  return {
    ...dataset,
    kolam: markKolamCache(dataset),
    am: markAmCache(dataset),
    sync: {
      pos: dataset.sync.pos === 'disabled' ? 'disabled' : 'cache',
      kolam: dataset.sync.kolam === 'disabled' ? 'disabled' : 'cache',
      am: dataset.am.source === 'disabled' ? 'disabled' : 'cache',
    },
  };
}

function markKolamCache(dataset: UnifiedDataset): UnifiedDataset['kolam'] {
  return dataset.kolam.source === 'disabled'
    ? dataset.kolam
    : {...dataset.kolam, source: 'cache'};
}

function markAmCache(dataset: UnifiedDataset): UnifiedDataset['am'] {
  return dataset.am.source === 'disabled'
    ? dataset.am
    : {...dataset.am, source: 'cache'};
}

function shouldPersistUnifiedDataset(dataset: UnifiedDataset) {
  return (Object.values(dataset.sync) as UnifiedSourceState[]).some(
    source => source === 'live',
  );
}

function normalizeCacheOwnerId(cacheOwnerId?: string) {
  return cacheOwnerId?.trim().toLowerCase().replace(/[^a-z0-9@._-]+/g, '-') ?? '';
}

function getStableRevision(value: unknown) {
  return String(hashString(stableStringify(value)));
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function hashString(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return hash >>> 0;
}
