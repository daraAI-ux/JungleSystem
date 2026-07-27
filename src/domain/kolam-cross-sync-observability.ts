export interface KolamCrossSyncObservabilityAlert {
  sku: string;
  platform: string;
  taskId: string;
  stockTxId: string;
  stockTxIds: string[];
  distinctTaskIds: string[];
  targetStocks: number[];
  note: string;
  signal: string;
  ageMs: number | null;
}

export interface KolamCrossSyncObservabilityCoalesceGroup {
  taskId: string;
  stockTxCount: number;
  platform: string;
}

export interface KolamCrossSyncObservabilityCounts {
  transactionsWithAudit: number;
  kolamPendingTaskIds: number;
  amInFlightStockSync: number;
  summary: Record<string, number>;
}

export interface KolamCrossSyncObservabilityReport {
  checkedAt: string;
  healthy: boolean;
  alertCount: number;
  amError: string;
  windowHours: number;
  counts: KolamCrossSyncObservabilityCounts;
  doubleTaskAlerts: KolamCrossSyncObservabilityAlert[];
  raceTargetStockAlerts: KolamCrossSyncObservabilityAlert[];
  stuckPending: KolamCrossSyncObservabilityAlert[];
  orphanAmTasks: KolamCrossSyncObservabilityAlert[];
  coalesceGroups: KolamCrossSyncObservabilityCoalesceGroup[];
}

export function formatCrossSyncObservabilityAge(ageMs?: number | null) {
  if (ageMs == null || !Number.isFinite(ageMs)) {
    return '—';
  }
  return `${Math.round(ageMs / 60000)} mnt`;
}

export function normalizeKolamCrossSyncObservabilityReport(
  payload: unknown,
): KolamCrossSyncObservabilityReport {
  const root = asRecord(payload);
  const data = asRecord(unwrapData(root));
  const counts = asRecord(data.counts);
  const summaryRaw = asRecord(counts.summary);
  const summary: Record<string, number> = {};
  Object.entries(summaryRaw).forEach(([key, value]) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(parsed)) {
      summary[key] = parsed;
    }
  });

  return {
    checkedAt: getString(data, 'checkedAt'),
    healthy: Boolean(data.healthy),
    alertCount: getNumber(data, 'alertCount') ?? 0,
    amError: getString(data, 'amError'),
    windowHours: getNumber(data, 'windowHours') ?? 48,
    counts: {
      transactionsWithAudit: getNumber(counts, 'transactionsWithAudit') ?? 0,
      kolamPendingTaskIds: getNumber(counts, 'kolamPendingTaskIds') ?? 0,
      amInFlightStockSync: getNumber(counts, 'amInFlightStockSync') ?? 0,
      summary,
    },
    doubleTaskAlerts: normalizeAlertList(data.doubleTaskAlerts),
    raceTargetStockAlerts: normalizeAlertList(data.raceTargetStockAlerts),
    stuckPending: normalizeAlertList(data.stuckPending),
    orphanAmTasks: normalizeAlertList(data.orphanAmTasks),
    coalesceGroups: normalizeCoalesceList(data.coalesceGroups),
  };
}

function normalizeAlertList(value: unknown): KolamCrossSyncObservabilityAlert[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(normalizeAlert);
}

function normalizeAlert(value: unknown): KolamCrossSyncObservabilityAlert {
  const record = asRecord(value);
  const stockTxIds = normalizeStringArray(record.stockTxIds);
  const stockTxId =
    getString(record, 'stockTxId') ||
    (typeof record.stockTxId === 'string' ? record.stockTxId : '') ||
    stockTxIds[0] ||
    '';

  return {
    sku: getString(record, 'sku'),
    platform: getString(record, 'platform'),
    taskId: getString(record, 'taskId'),
    stockTxId,
    stockTxIds,
    distinctTaskIds: normalizeStringArray(record.distinctTaskIds),
    targetStocks: normalizeNumberArray(record.targetStocks),
    note: getString(record, 'note'),
    signal: getString(record, 'signal'),
    ageMs: getNumber(record, 'ageMs') ?? null,
  };
}

function normalizeCoalesceList(
  value: unknown,
): KolamCrossSyncObservabilityCoalesceGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const taskId = getString(record, 'taskId');
      if (!taskId) {
        return null;
      }
      return {
        taskId,
        stockTxCount: getNumber(record, 'stockTxCount') ?? 0,
        platform: getString(record, 'platform'),
      };
    })
    .filter(Boolean) as KolamCrossSyncObservabilityCoalesceGroup[];
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : String(item ?? '')))
    .filter(Boolean);
}

function normalizeNumberArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'number' ? item : Number(item)))
    .filter(item => Number.isFinite(item));
}

function unwrapData(payload: Record<string, unknown>): unknown {
  if ('data' in payload) {
    return payload.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value == null) {
    return '';
  }
  return String(value).trim();
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
