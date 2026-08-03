import type {KolamStatusBadgeIntent} from '../components/kolam-status-badge-types';

/**
 * DARA async jobs — Pusat AI tab Proses.
 * SoT: FE `JobsHistoryPanel` + `api/dara-jobs` + `dara-job-labels` + `dara-job-storage`.
 */

export type KolamDaraJobModule = 'seo' | 'market-intel' | 'pricing';

export type KolamDaraJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed';

export type KolamDaraAsyncJob = {
  id: string;
  module: KolamDaraJobModule | string;
  jobType: string;
  status: KolamDaraJobStatus | string;
  label: string;
  progressCurrent: number;
  progressTotal: number;
  progressMessage: string;
  error: string;
  createdAt: string;
  finishedAt: string;
};

export type KolamDaraJobsModuleFilter = 'all' | KolamDaraJobModule;
export type KolamDaraJobsStatusFilter =
  | 'all'
  | 'active'
  | 'completed'
  | 'failed';

/** FE `MODULE_OPTS` — JobsHistoryPanel. */
export const KOLAM_DARA_JOBS_MODULE_OPTIONS: Array<{
  label: string;
  value: KolamDaraJobsModuleFilter;
}> = [
  {label: 'Semua modul', value: 'all'},
  {label: 'DARA SEO', value: 'seo'},
  {label: 'DARA Market Intel', value: 'market-intel'},
];

/** FE `STATUS_OPTS` — JobsHistoryPanel. */
export const KOLAM_DARA_JOBS_STATUS_OPTIONS: Array<{
  label: string;
  value: KolamDaraJobsStatusFilter;
}> = [
  {label: 'Semua status', value: 'all'},
  {label: 'Berjalan / antrian', value: 'active'},
  {label: 'Selesai', value: 'completed'},
  {label: 'Gagal', value: 'failed'},
];

/** FE helper card above JobsHistoryPanel on Proses tab. */
export const KOLAM_PUSAT_AI_PROSES_HELPER_COPY =
  'Progress bar hanya tampil saat proses berjalan. «Tutup» menyembunyikan job selesai/gagal dari daftar ini (72 jam terakhir).';

export const KOLAM_PUSAT_AI_PROSES_EMPTY_COPY =
  'Belum ada proses dalam 72 jam terakhir.';

const DARA_DISMISSED_JOB_IDS_KEY = 'dara-dismissed-job-ids-v1';
const dismissedIdsMemory = new Set<string>();

const DARA_JOB_LABELS: Record<string, string> = {
  'seo.bulk_products': 'Audit bulk produk',
  'seo.bulk_blogs': 'Audit bulk blog',
  'seo.bulk_species': 'Audit bulk livestock',
  'seo.serp_monitor': 'SERP monitor',
  'seo.audit_product': 'Audit SEO produk',
  'seo.audit_blog': 'Audit SEO blog',
  'seo.audit_species': 'Audit SEO livestock',
  'seo.audit_website': 'Audit SEO website',
  'seo.regenerate_draft': 'Buat ulang draft SEO',
  'market.scan_bulk': 'Scan market intelligence',
  'market.analyze_product': 'Analisis market produk',
  'market.channel_pricing_scan': 'Scan channel pricing',
  'market.competitor_sync': 'Sinkron mapping kompetitor',
  'pricing.equipment_kolam': 'DARA Peralatan — harga Kolam',
  'pricing.equipment_marketplace_db':
    'DARA Peralatan — harga marketplace (DB)',
  'pricing.push_olshop': 'DARA Peralatan — push ke olshop',
};

export function labelForKolamDaraJobType(jobType: string, fallback?: string) {
  return DARA_JOB_LABELS[jobType] || fallback || jobType;
}

/** FE badge: seo → SEO, otherwise Market. */
export function formatKolamDaraJobModuleLabel(module: string) {
  return module === 'seo' ? 'SEO' : 'Market';
}

/** FE `statusIntent`. */
export function getKolamDaraJobStatusIntent(
  status: string,
): KolamStatusBadgeIntent {
  if (status === 'completed') {
    return 'success';
  }
  if (status === 'failed') {
    return 'danger';
  }
  if (status === 'running') {
    return 'warning';
  }
  return 'secondary';
}

/** FE `pct2`. */
export function getKolamDaraJobProgressPercent(job: KolamDaraAsyncJob) {
  if (job.status === 'completed') {
    return 100;
  }
  if (job.progressTotal > 0) {
    return Math.min(
      100,
      Math.round((job.progressCurrent / job.progressTotal) * 100),
    );
  }
  return job.status === 'running' ? 15 : 5;
}

export function formatKolamDaraJobProgressLabel(job: KolamDaraAsyncJob) {
  const active = job.status === 'queued' || job.status === 'running';
  if (job.progressTotal > 0) {
    return `${job.progressCurrent}/${job.progressTotal}`;
  }
  return active ? '…' : '—';
}

export function isKolamDaraJobActive(job: KolamDaraAsyncJob) {
  return job.status === 'queued' || job.status === 'running';
}

export function filterKolamDaraJobs(
  jobs: KolamDaraAsyncJob[],
  statusFilter: KolamDaraJobsStatusFilter,
) {
  if (statusFilter === 'completed') {
    return jobs.filter(job => job.status === 'completed');
  }
  if (statusFilter === 'failed') {
    return jobs.filter(job => job.status === 'failed');
  }
  return jobs;
}

/** FE `isJobDismissed` / `dismissTrackedJob` (localStorage key parity). */
export function readKolamDaraDismissedJobIds(): Set<string> {
  try {
    const storage = (globalThis as {localStorage?: Storage}).localStorage;
    const raw = storage?.getItem(DARA_DISMISSED_JOB_IDS_KEY);
    if (!raw) {
      return new Set(dismissedIdsMemory);
    }
    const parsed = JSON.parse(raw) as unknown;
    const fromStorage = new Set(
      Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : [],
    );
    for (const id of dismissedIdsMemory) {
      fromStorage.add(id);
    }
    return fromStorage;
  } catch {
    return new Set(dismissedIdsMemory);
  }
}

export function isKolamDaraJobDismissed(jobId: string) {
  return readKolamDaraDismissedJobIds().has(jobId);
}

export function dismissKolamDaraJob(jobId: string) {
  const dismissed = readKolamDaraDismissedJobIds();
  dismissed.add(jobId);
  dismissedIdsMemory.add(jobId);
  try {
    (globalThis as {localStorage?: Storage}).localStorage?.setItem(
      DARA_DISMISSED_JOB_IDS_KEY,
      JSON.stringify([...dismissed].slice(0, 200)),
    );
  } catch {
    // Memory set is enough for the current process.
  }
}

export function normalizeKolamDaraJob(payload: unknown): KolamDaraAsyncJob | null {
  const row = asRecord(payload);
  const id =
    (typeof row._id === 'string' && row._id) ||
    (typeof row.id === 'string' && row.id) ||
    '';
  if (!id) {
    return null;
  }

  const progress = asRecord(row.progress);
  const jobType = typeof row.jobType === 'string' ? row.jobType : '';
  const labelRaw = typeof row.label === 'string' ? row.label.trim() : '';

  return {
    id,
    module: typeof row.module === 'string' ? row.module : '',
    jobType,
    status: typeof row.status === 'string' ? row.status : '',
    label: labelRaw || labelForKolamDaraJobType(jobType),
    progressCurrent: toFiniteNumber(progress.current),
    progressTotal: toFiniteNumber(progress.total),
    progressMessage:
      typeof progress.message === 'string' ? progress.message.trim() : '',
    error: typeof row.error === 'string' ? row.error.trim() : '',
    createdAt: typeof row.createdAt === 'string' ? row.createdAt : '',
    finishedAt: typeof row.finishedAt === 'string' ? row.finishedAt : '',
  };
}

export function normalizeKolamDaraJobList(payload: unknown): KolamDaraAsyncJob[] {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  const list = Array.isArray(data.jobs)
    ? data.jobs
    : Array.isArray(root.jobs)
      ? root.jobs
      : Array.isArray(payload)
        ? payload
        : [];

  return list
    .map(item => normalizeKolamDaraJob(item))
    .filter((item): item is KolamDaraAsyncJob => item != null);
}

export function normalizeKolamDaraSeoNormalizeResult(payload: unknown): {
  updated: number;
} {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  return {updated: toFiniteNumber(data.updated ?? root.updated)};
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toFiniteNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
