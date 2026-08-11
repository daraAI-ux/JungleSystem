/**
 * DARA Tax Regulasi RMS types.
 * SoT: plugin tax-phase4-tools + dara-tax-rms-api + regulation sources.
 */

export type KolamDaraTaxRmsSubTab =
  | 'ringkasan'
  | 'kitab'
  | 'draft'
  | 'versi'
  | 'kb'
  | 'audit'
  | 'maintenance';

export const KOLAM_DARA_TAX_RMS_TABS: Array<{
  id: KolamDaraTaxRmsSubTab;
  label: string;
  adminOnly?: boolean;
  approveOnly?: boolean;
}> = [
  { id: 'ringkasan', label: 'Ringkasan' },
  { id: 'kitab', label: 'Kitab' },
  { id: 'draft', label: 'Draf' },
  { id: 'versi', label: 'Versi' },
  { id: 'kb', label: 'Basis pengetahuan' },
  { id: 'audit', label: 'Log audit', approveOnly: true },
  { id: 'maintenance', label: 'Pemeliharaan', adminOnly: true },
];

export const KOLAM_DARA_TAX_WATCH_STATUS_LABEL: Record<string, string> = {
  never_checked: 'Belum dicek',
  waiting_interval: 'OK',
  due: 'Perlu cek',
  error: 'Bermasalah',
  disabled: 'Nonaktif',
};

export type KolamDaraTaxRegulationVersion = {
  id: string;
  versionNumber: string;
  title: string;
  status: string;
  effectiveDate: string;
  ppnRate: number | null;
};

export type KolamDaraTaxRegulationDraft = {
  id: string;
  title: string;
  status: string;
  changeDiffSummary: string;
  aiSummary: string;
  lawReferences: string[];
  ppnRate: number | null;
  pph23Rate: number | null;
  umkmFinalRate: number | null;
};

export type KolamDaraTaxRegulationSource = {
  id: string;
  name: string;
  url: string;
  authority: string;
  isActive: boolean;
  checkIntervalHours: number;
  lastCheckedAt: string;
  lastError: string;
  watchStatus: string;
};

export type KolamDaraTaxKnowledge = {
  id: string;
  title: string;
  category: string;
  version: string;
  updatedAt: string;
};

export type KolamDaraTaxAuditLog = {
  id: string;
  action: string;
  toolName: string;
  resultSummary: string;
  success: boolean;
  createdAt: string;
};

export type KolamDaraTaxKitabRow = {
  moduleId: string;
  modul: string;
  systemFormula: string;
  dasarHukum: string;
  statusCode: string;
  statusLabel: string;
};

export type KolamDaraTaxKitab = {
  generatedAt: string;
  taxpayerLabel: string;
  legalName: string;
  activeVersionNumber: string;
  activeTitle: string;
  rows: KolamDaraTaxKitabRow[];
  disclaimer: string;
};

export type KolamDaraTaxMonitoringSource = {
  id: string;
  name: string;
  url: string;
  watchStatus: string;
  lastCheckedAt: string;
};

export type KolamDaraTaxTaxStatus = {
  taxEnabled: boolean;
  watcherEnabled: boolean;
  disclaimer: string;
  watcherRuntimeStatus: string;
  watcherCron: string;
  watcherTimezone: string;
  watcherManualInFlight: boolean;
  monitored: number;
  total: number;
  withError: number;
  dueNow: number;
  sources: KolamDaraTaxMonitoringSource[];
  checkedAt: string;
};

export type KolamDaraTaxVersionCompare = {
  summary: string;
  formulaDiffs: Array<{ field: string; before: string; after: string }>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function unwrapData(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return root.data as Record<string, unknown>;
  }
  return root;
}

function unwrapItems(payload: unknown): unknown[] {
  const data = unwrapData(payload);
  if (Array.isArray(data.items)) {
    return data.items;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
}

export function normalizeKolamDaraTaxRegulationVersions(
  payload: unknown,
): KolamDaraTaxRegulationVersion[] {
  return unwrapItems(payload)
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      const formulas = asRecord(row.formulas);
      return {
        id,
        versionNumber: String(row.versionNumber || '').trim(),
        title: String(row.title || '').trim(),
        status: String(row.status || '').trim(),
        effectiveDate: String(row.effectiveDate || '').trim(),
        ppnRate:
          formulas.ppnRate == null || formulas.ppnRate === ''
            ? null
            : asNumber(formulas.ppnRate),
      };
    })
    .filter((row): row is KolamDaraTaxRegulationVersion => row != null);
}

export function normalizeKolamDaraTaxRegulationDrafts(
  payload: unknown,
): KolamDaraTaxRegulationDraft[] {
  return unwrapItems(payload)
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      const formulas = asRecord(row.extractedFormulas);
      return {
        id,
        title: String(row.title || '').trim(),
        status: String(row.status || '').trim(),
        changeDiffSummary: String(row.changeDiffSummary || '').trim(),
        aiSummary: String(row.aiSummary || '').trim(),
        lawReferences: Array.isArray(row.lawReferences)
          ? row.lawReferences.map(v => String(v || '').trim()).filter(Boolean)
          : [],
        ppnRate:
          formulas.ppnRate == null || formulas.ppnRate === ''
            ? null
            : asNumber(formulas.ppnRate),
        pph23Rate:
          formulas.pph23Rate == null || formulas.pph23Rate === ''
            ? null
            : asNumber(formulas.pph23Rate),
        umkmFinalRate:
          formulas.umkmFinalRate == null || formulas.umkmFinalRate === ''
            ? null
            : asNumber(formulas.umkmFinalRate),
      };
    })
    .filter((row): row is KolamDaraTaxRegulationDraft => row != null);
}

export function normalizeKolamDaraTaxRegulationSources(
  payload: unknown,
): KolamDaraTaxRegulationSource[] {
  return unwrapItems(payload)
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        name: String(row.name || '').trim(),
        url: String(row.url || '').trim(),
        authority: String(row.authority || '').trim() || 'manual',
        isActive: row.isActive !== false,
        checkIntervalHours: asNumber(row.checkIntervalHours) || 24,
        lastCheckedAt: String(row.lastCheckedAt || '').trim(),
        lastError: String(row.lastError || '').trim(),
        watchStatus: String(row.watchStatus || '').trim(),
      };
    })
    .filter((row): row is KolamDaraTaxRegulationSource => row != null);
}

export function normalizeKolamDaraTaxKnowledge(
  payload: unknown,
): KolamDaraTaxKnowledge[] {
  return unwrapItems(payload)
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        title: String(row.title || '').trim(),
        category: String(row.category || '').trim(),
        version: String(row.version || '').trim(),
        updatedAt: String(row.updatedAt || '').trim(),
      };
    })
    .filter((row): row is KolamDaraTaxKnowledge => row != null);
}

export function normalizeKolamDaraTaxAuditLogs(
  payload: unknown,
): KolamDaraTaxAuditLog[] {
  return unwrapItems(payload)
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        action: String(row.action || '').trim(),
        toolName: String(row.toolName || '').trim(),
        resultSummary: String(row.resultSummary || '').trim(),
        success: row.success !== false,
        createdAt: String(row.createdAt || '').trim(),
      };
    })
    .filter((row): row is KolamDaraTaxAuditLog => row != null);
}

export function normalizeKolamDaraTaxKitab(
  payload: unknown,
): KolamDaraTaxKitab {
  const data = unwrapData(payload);
  const profile = asRecord(data.profileSummary);
  const active = asRecord(data.activeRegulation);
  const rowsRaw = Array.isArray(data.rows) ? data.rows : [];
  return {
    generatedAt: String(data.generatedAt || '').trim(),
    taxpayerLabel: String(profile.taxpayerLabel || '').trim(),
    legalName: String(profile.legalName || '').trim(),
    activeVersionNumber: String(active.versionNumber || '').trim(),
    activeTitle: String(active.title || '').trim(),
    disclaimer: String(data.disclaimer || '').trim(),
    rows: rowsRaw
      .map(item => {
        const row = asRecord(item);
        const status = asRecord(row.status);
        return {
          moduleId: String(row.moduleId || '').trim(),
          modul: String(row.modul || '').trim(),
          systemFormula: String(row.systemFormula || '').trim(),
          dasarHukum: String(row.dasarHukum || '').trim(),
          statusCode: String(status.code || '').trim(),
          statusLabel: String(status.label || '').trim(),
        };
      })
      .filter(row => row.moduleId || row.modul),
  };
}

export function normalizeKolamDaraTaxTaxStatus(
  payload: unknown,
): KolamDaraTaxTaxStatus {
  const data = unwrapData(payload);
  const monitoring = asRecord(data.monitoring);
  const watcher = asRecord(monitoring.watcher);
  const summary = asRecord(monitoring.summary);
  const sourcesRaw = Array.isArray(monitoring.sources)
    ? monitoring.sources
    : [];
  return {
    taxEnabled: data.taxEnabled !== false,
    watcherEnabled: data.taxRegulationWatcherEnabled === true,
    disclaimer: String(data.disclaimer || '').trim(),
    watcherRuntimeStatus: String(watcher.runtimeStatus || '').trim(),
    watcherCron: String(watcher.cron || '').trim(),
    watcherTimezone: String(watcher.timezone || '').trim(),
    watcherManualInFlight: watcher.manualRunInFlight === true,
    monitored: asNumber(summary.monitored),
    total: asNumber(summary.total),
    withError: asNumber(summary.withError),
    dueNow: asNumber(summary.dueNow),
    sources: sourcesRaw
      .map(item => {
        const row = asRecord(item);
        const id = String(row._id || row.id || '').trim();
        if (!id) {
          return null;
        }
        return {
          id,
          name: String(row.name || '').trim(),
          url: String(row.url || '').trim(),
          watchStatus: String(row.watchStatus || '').trim(),
          lastCheckedAt: String(row.lastCheckedAt || '').trim(),
        };
      })
      .filter((row): row is KolamDaraTaxMonitoringSource => row != null),
    checkedAt: String(monitoring.checkedAt || '').trim(),
  };
}

export function normalizeKolamDaraTaxVersionCompare(
  payload: unknown,
): KolamDaraTaxVersionCompare {
  const data = unwrapData(payload);
  const diffs = Array.isArray(data.formulaDiffs) ? data.formulaDiffs : [];
  return {
    summary: String(data.summary || '').trim(),
    formulaDiffs: diffs.map(item => {
      const row = asRecord(item);
      return {
        field: String(row.field || '').trim(),
        before: String(row.before ?? ''),
        after: String(row.after ?? ''),
      };
    }),
  };
}

export function formatKolamDaraTaxDateTimeId(iso?: string | null) {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Client page size — parity DARA SEO audit / mentions. */
export const KOLAM_DARA_TAX_AUDIT_LOGS_PAGE_SIZE = 10;

export function paginateKolamDaraTaxAuditLogs(
  list: KolamDaraTaxAuditLog[],
  page: number,
  pageSize = KOLAM_DARA_TAX_AUDIT_LOGS_PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    totalPages,
    total: list.length,
    items: list.slice(start, start + pageSize),
  };
}
