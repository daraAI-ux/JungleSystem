/**
 * Pelatihan DARA — Video Studio.
 * SoT: DA-Dara-Plugin `dara-video-studio-tab` + FE `api/dara-training` video-studio endpoints.
 */

export type KolamDaraTrainingVideoStudioJobStatus =
  | 'queued'
  | 'uploading'
  | 'submitted'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type KolamDaraTrainingVideoStudioModelCapabilities = {
  durations: number[];
  resolutions: string[];
};

export type KolamDaraTrainingVideoStudioConfig = {
  apiKeyConfigured: boolean;
  region: string;
  defaultModel: string;
  models: string[];
  maxUploadBytes: number;
  maxSourceDurationSeconds: number;
  supportedDurations: number[];
  supportedAspectRatios: string[];
  supportedResolutions: string[];
  cancelSupported: boolean;
  modelCapabilities: Record<string, KolamDaraTrainingVideoStudioModelCapabilities>;
  publicUploadConfigured: boolean;
  preset: {
    name: string;
    prompt: string;
  };
};

export type KolamDaraTrainingVideoStudioUpload = {
  sourceFilename: string;
  sourceMimeType: string;
  sourceSizeBytes: number;
  sourceDurationSeconds: number | null;
  uploadToken: string;
  rawAccessExpiresAt: string;
  sourceVideoUrl: string;
  requiresPublicUrl: boolean;
};

export type KolamDaraTrainingVideoStudioJob = {
  id: string;
  status: KolamDaraTrainingVideoStudioJobStatus;
  prompt: string;
  presetName: string;
  model: string;
  duration: number | null;
  aspectRatio: string;
  resolution: string;
  watermark: boolean;
  sourceFilename: string;
  sourceMimeType: string;
  sourceSizeBytes: number;
  sourceVideoUrl: string;
  sourcePath: string;
  externalTaskId: string;
  outputUrl: string;
  outputPath: string;
  overlayLogo: boolean;
  errorMessage: string;
  providerStatus: string;
  submittedAt: string;
  finishedAt: string;
  cancelledAt: string;
  createdAt: string;
  updatedAt: string;
};

export type KolamDaraTrainingVideoStudioCreateInput = {
  prompt: string;
  presetName?: string;
  model: string;
  duration?: number | null;
  aspectRatio?: string;
  resolution?: string;
  overlayLogo?: boolean;
  sourceFilename?: string;
  sourceMimeType?: string;
  sourceSizeBytes?: number;
  sourceVideoUrl?: string;
  uploadToken?: string;
};

export const KOLAM_DARA_TRAINING_VIDEO_STUDIO_STATUS_LABEL: Record<
  string,
  string
> = {
  queued: 'Antre',
  uploading: 'Unggah',
  submitted: 'Terkirim',
  processing: 'Diproses',
  succeeded: 'Selesai',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
};

export const KOLAM_DARA_TRAINING_VIDEO_STUDIO_RATIO_LABEL: Record<
  string,
  string
> = {
  '': 'Otomatis / ikut sumber',
  '21:9': '21:9 Cinematic wide',
  '16:9': '16:9 Landscape',
  '4:3': '4:3 Standard',
  '1:1': '1:1 Square',
  '3:4': '3:4 Portrait',
  '9:16': '9:16 Vertical',
};

const TERMINAL_JOB_STATUSES = new Set<KolamDaraTrainingVideoStudioJobStatus>([
  'succeeded',
  'failed',
  'cancelled',
]);

export function formatKolamDaraTrainingVideoStudioDate(iso?: string | null) {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}

export function formatKolamDaraTrainingVideoStudioBytes(value?: number | null) {
  const bytes = Math.max(0, Math.floor(Number(value)) || 0);
  if (!bytes) {
    return '0 B';
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function resolveKolamDaraTrainingVideoStudioStatusLabel(
  status: string,
): string {
  return (
    KOLAM_DARA_TRAINING_VIDEO_STUDIO_STATUS_LABEL[status] ||
    status ||
    '—'
  );
}

export function resolveKolamDaraTrainingVideoStudioStatusIntent(
  status: string,
): 'success' | 'danger' | 'secondary' | 'warning' {
  if (status === 'succeeded') {
    return 'success';
  }
  if (status === 'failed') {
    return 'danger';
  }
  if (status === 'cancelled') {
    return 'secondary';
  }
  return 'warning';
}

export function isKolamDaraTrainingVideoStudioTerminalStatus(
  status: string,
): boolean {
  return TERMINAL_JOB_STATUSES.has(
    status as KolamDaraTrainingVideoStudioJobStatus,
  );
}

export function normalizeKolamDaraTrainingVideoStudioConfig(
  payload: unknown,
): KolamDaraTrainingVideoStudioConfig {
  const row = unwrapDataRecord(payload);
  const preset = asRecord(row.preset);
  const capabilitiesRaw = asRecord(row.modelCapabilities);
  const modelCapabilities: Record<
    string,
    KolamDaraTrainingVideoStudioModelCapabilities
  > = {};

  Object.entries(capabilitiesRaw).forEach(([key, value]) => {
    const cap = asRecord(value);
    modelCapabilities[key] = {
      durations: asNumberArray(cap.durations),
      resolutions: asStringArray(cap.resolutions),
    };
  });

  return {
    apiKeyConfigured: row.apiKeyConfigured === true,
    region: String(row.region || 'ap-southeast').trim(),
    defaultModel: String(row.defaultModel || '').trim(),
    models: asStringArray(row.models),
    maxUploadBytes: asNumber(row.maxUploadBytes),
    maxSourceDurationSeconds: asNumber(row.maxSourceDurationSeconds),
    supportedDurations: asNumberArray(row.supportedDurations),
    supportedAspectRatios: asStringArray(row.supportedAspectRatios),
    supportedResolutions: asStringArray(row.supportedResolutions),
    cancelSupported: row.cancelSupported === true,
    modelCapabilities,
    publicUploadConfigured: row.publicUploadConfigured === true,
    preset: {
      name: String(preset.name || '').trim(),
      prompt: String(preset.prompt || '').trim(),
    },
  };
}

export function normalizeKolamDaraTrainingVideoStudioUpload(
  payload: unknown,
): KolamDaraTrainingVideoStudioUpload {
  const row = unwrapDataRecord(payload);
  return {
    sourceFilename: String(row.sourceFilename || '').trim(),
    sourceMimeType: String(row.sourceMimeType || '').trim(),
    sourceSizeBytes: asNumber(row.sourceSizeBytes),
    sourceDurationSeconds:
      row.sourceDurationSeconds == null
        ? null
        : asNumber(row.sourceDurationSeconds),
    uploadToken: String(row.uploadToken || '').trim(),
    rawAccessExpiresAt: String(row.rawAccessExpiresAt || '').trim(),
    sourceVideoUrl: String(row.sourceVideoUrl || '').trim(),
    requiresPublicUrl: row.requiresPublicUrl === true,
  };
}

export function normalizeKolamDaraTrainingVideoStudioJob(
  payload: unknown,
): KolamDaraTrainingVideoStudioJob | null {
  const row = asRecord(payload);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const statusRaw = String(row.status || 'queued').trim();
  const status = (
    statusRaw in KOLAM_DARA_TRAINING_VIDEO_STUDIO_STATUS_LABEL
      ? statusRaw
      : 'queued'
  ) as KolamDaraTrainingVideoStudioJobStatus;

  return {
    id,
    status,
    prompt: String(row.prompt || '').trim(),
    presetName: String(row.presetName || '').trim(),
    model: String(row.model || '').trim(),
    duration:
      row.duration == null || row.duration === ''
        ? null
        : asNumber(row.duration),
    aspectRatio: String(row.aspectRatio || '').trim(),
    resolution: String(row.resolution || '').trim(),
    watermark: row.watermark === true,
    sourceFilename: String(row.sourceFilename || '').trim(),
    sourceMimeType: String(row.sourceMimeType || '').trim(),
    sourceSizeBytes: asNumber(row.sourceSizeBytes),
    sourceVideoUrl: String(row.sourceVideoUrl || '').trim(),
    sourcePath: String(row.sourcePath || '').trim(),
    externalTaskId: String(row.externalTaskId || '').trim(),
    outputUrl: String(row.outputUrl || '').trim(),
    outputPath: String(row.outputPath || '').trim(),
    overlayLogo: row.overlayLogo === true,
    errorMessage: String(row.errorMessage || '').trim(),
    providerStatus: String(row.providerStatus || '').trim(),
    submittedAt: String(row.submittedAt || '').trim(),
    finishedAt: String(row.finishedAt || '').trim(),
    cancelledAt: String(row.cancelledAt || '').trim(),
    createdAt: String(row.createdAt || '').trim(),
    updatedAt: String(row.updatedAt || '').trim(),
  };
}

export function normalizeKolamDaraTrainingVideoStudioJobList(
  payload: unknown,
): KolamDaraTrainingVideoStudioJob[] {
  return listFrom(payload)
    .map(normalizeKolamDaraTrainingVideoStudioJob)
    .filter((row): row is KolamDaraTrainingVideoStudioJob => row != null);
}

function listFrom(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  const root = asRecord(payload);
  return Array.isArray(root.data) ? root.data : [];
}

function unwrapDataRecord(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    return asRecord(root.data);
  }
  return root;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(item => String(item || '').trim()).filter(Boolean);
}

function asNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => asNumber(item))
    .filter(item => Number.isFinite(item) && item > 0);
}
