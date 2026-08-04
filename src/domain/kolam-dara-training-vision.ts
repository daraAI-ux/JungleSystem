/**
 * Pelatihan DARA — Vision inbox.
 * SoT: DA-Dara-Plugin `dara-training-vision-tab` + FE `api/dara-training` vision endpoints.
 */

export type KolamDaraTrainingVisionSectionId =
  | 'ringkasan'
  | 'indeks'
  | 'species'
  | 'produk'
  | 'eval'
  | 'baseline'
  | 'luar'
  | 'koreksi';

export const KOLAM_DARA_TRAINING_VISION_SECTIONS: Array<{
  id: KolamDaraTrainingVisionSectionId;
  label: string;
}> = [
  {id: 'ringkasan', label: 'Ringkasan'},
  {id: 'indeks', label: 'Indeks katalog'},
  {id: 'species', label: 'Species (YOLO)'},
  {id: 'produk', label: 'Produk'},
  {id: 'eval', label: 'Eval holdout'},
  {id: 'baseline', label: 'Baseline KPI'},
  {id: 'luar', label: 'Di luar katalog'},
  {id: 'koreksi', label: 'Koreksi inbox'},
];

/** BE `MIN_VISION_TRAINING_PHOTOS` default (species YOLO). */
export const KOLAM_DARA_TRAINING_VISION_MIN_SPECIES_PHOTOS = 5;
/** BE `MIN_YOLO_PRODUCT_TRAIN_PHOTOS` default (produk YOLO). */
export const KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS = 3;

/**
 * Foto yang dihitung untuk Status siap latih: Training (dataset) atau Katalog
 * (sumber yang bisa ditambah lewat Kelola) — ambil yang lebih besar.
 * YOLO export tetap butuh foto sudah masuk dataset Training.
 */
export function resolveKolamDaraTrainingVisionTrainPhotoCount(
  trainingCount: number,
  catalogPhotoCount: number,
): number {
  const training = Math.max(0, Math.floor(Number(trainingCount)) || 0);
  const catalog = Math.max(0, Math.floor(Number(catalogPhotoCount)) || 0);
  return Math.max(training, catalog);
}

/**
 * Train-ready when available photo count meets the YOLO min.
 * SoT mins: species `MIN_VISION_TRAINING_PHOTOS` (5), product `MIN_YOLO_PRODUCT_TRAIN_PHOTOS` (3).
 */
export function isKolamDaraTrainingVisionReadyForTrain(
  trainingCount: number,
  minPhotos: number,
  catalogPhotoCount = 0,
): boolean {
  const min = Math.max(
    1,
    Math.floor(Number(minPhotos)) ||
      KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
  );
  return (
    resolveKolamDaraTrainingVisionTrainPhotoCount(
      trainingCount,
      catalogPhotoCount,
    ) >= min
  );
}

/** Status badge: Siap latih | n/min (max Training, Katalog). */
export function formatKolamDaraTrainingVisionTrainStatusLabel(
  trainingCount: number,
  minPhotos: number,
  catalogPhotoCount = 0,
): {ready: boolean; label: string} {
  const min = Math.max(
    1,
    Math.floor(Number(minPhotos)) ||
      KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
  );
  const count = resolveKolamDaraTrainingVisionTrainPhotoCount(
    trainingCount,
    catalogPhotoCount,
  );
  const ready = count >= min;
  return {
    ready,
    label: ready ? 'Siap latih' : `${count}/${min}`,
  };
}

export type KolamDaraTrainingVisionMatchStatus =
  | 'match'
  | 'ambiguous'
  | 'weak'
  | 'error'
  | 'unknown';

export type KolamDaraTrainingVisionFeedbackKind = 'all' | 'species' | 'product';

export type KolamDaraTrainingVisionIdLabel = {id: string; label: string};

export type KolamDaraTrainingVisionClipJob = {
  status: string;
  kind: string;
  error: string;
};

export type KolamDaraTrainingVisionStats = {
  trainingPhotos: number;
  speciesWithTraining: number;
  speciesReadyForTrain: number;
  feedbackTotal: number;
  minTrainingPhotos: number;
  yoloModelReady: boolean;
  yoloClassCount: number;
  clipIndexTotal: number;
  clipIndexClipCount: number;
  clipIndexMissing: number;
  clipIndexJob: KolamDaraTrainingVisionClipJob | null;
  hardNegativeCount: number;
  feedbackPending: number;
  speciesTrainingPhotos: number;
  productTrainingPhotos: number;
  productsWithTraining: number;
  closedWorldMode: boolean;
  ocrUnifiedEnabled: boolean;
  ocrEngine: string;
  ocrTesseractFallback: boolean;
  detectCropMode: string;
  detectCropModel: string;
  detectCropBackend: string;
  feedbackSpeciesTotal: number;
  feedbackProductTotal: number;
  yoloProductModelReady: boolean;
  yoloProductClassCount: number;
  minProductTrainingPhotos: number;
  visionLlmFallbackEnabled: boolean;
  visionLlmFallbackReady: boolean;
  embedModelId: string;
  embedFamily: string;
  embedMinScore: number | null;
  embedIndexCurrentModel: number;
  embedIndexStale: number;
  negativeTypes: KolamDaraTrainingVisionIdLabel[];
};

/** Page size for Species (YOLO) / Produk list tables (BE max 50). */
export const KOLAM_DARA_TRAINING_VISION_LIST_PAGE_SIZE = 10;

export type KolamDaraTrainingVisionSpecies = {
  speciesId: string;
  displayName: string;
  scientificName: string;
  catalogPhotoCount: number;
  trainingCount: number;
  readyForTrain: boolean;
  catalogPhotos: string[];
};

export type KolamDaraTrainingVisionSpeciesList = {
  rows: KolamDaraTrainingVisionSpecies[];
  page: number;
  pages: number;
  total: number;
};

export type KolamDaraTrainingVisionProduct = {
  productId: string;
  displayName: string;
  name: string;
  sku: string;
  catalogPhotoCount: number;
  trainingCount: number;
  readyForIndex: boolean;
  catalogPhotos: string[];
};

export type KolamDaraTrainingVisionProductList = {
  rows: KolamDaraTrainingVisionProduct[];
  page: number;
  pages: number;
  total: number;
};

export type KolamDaraTrainingVisionPhoto = {
  id: string;
  photoKey: string;
  source: string;
  createdAt: string;
};

export type KolamDaraTrainingVisionFeedback = {
  id: string;
  conversationId: string;
  buyerImageUrl: string;
  matchStatus: KolamDaraTrainingVisionMatchStatus;
  entityKind: 'species' | 'product' | '';
  suggestedDisplayName: string;
  correctDisplayName: string;
  correctSku: string;
  notes: string;
  inTrainingDataset: boolean;
  createdAt: string;
};

export type KolamDaraTrainingVisionFeedbackList = {
  rows: KolamDaraTrainingVisionFeedback[];
  page: number;
  pages: number;
  total: number;
};

export type KolamDaraTrainingVisionHardNegative = {
  id: string;
  photoKey: string;
  negativeType: string;
  createdAt: string;
};

export type KolamDaraTrainingVisionFeedbackQueueItem = {
  id: string;
  conversationId: string;
  buyerImageUrl: string;
  entityKind: 'species' | 'product' | '';
  correctDisplayName: string;
  correctSku: string;
  matchStatus: string;
  createdAt: string;
};

export type KolamDaraTrainingVisionEvalMetric = {
  total: number;
  correct: number;
  accuracy: number;
  error: string;
};

export type KolamDaraTrainingVisionEvalRun = {
  id: string;
  kind: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  error: string;
  siglip: KolamDaraTrainingVisionEvalMetric | null;
  yoloSpecies: KolamDaraTrainingVisionEvalMetric | null;
  yoloProduct: KolamDaraTrainingVisionEvalMetric | null;
};

export type KolamDaraTrainingVisionBaselineKpi = {
  periodDays: number;
  since: string;
  until: string;
  inboxSource: string;
  inboxEventCount: number | null;
  inboxAutoReply: number;
  inboxVisionMatch: number;
  inboxVisionAmbiguous: number;
  inboxVisionLlm: number;
  inboxClarifyAbstain: number;
  inboxPayment: number;
  inboxSkippedDedup: number;
  inboxAbstainRate: number;
  inboxAutoReplyRate: number;
  inboxByMatchMethod: Array<{method: string; count: number}>;
  feedbackTotal: number;
  feedbackFalseMatch: number;
  feedbackFalseMatchRate: number;
  precisionPct: number | null;
  precisionNote: string;
  latestHoldoutSiglipAccuracy: number | null;
};

export type KolamDaraTrainingVisionActionResult = {
  success: boolean;
  message: string;
};

export const KOLAM_DARA_TRAINING_VISION_MATCH_LABELS: Record<
  KolamDaraTrainingVisionMatchStatus,
  string
> = {
  match: 'Cocok',
  ambiguous: 'Ambigu',
  weak: 'Lemah',
  error: 'Error',
  unknown: '—',
};

export function resolveKolamDaraTrainingVisionMatchIntent(
  status: string,
): 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'match') {
    return 'success';
  }
  if (status === 'ambiguous') {
    return 'warning';
  }
  if (status === 'weak' || status === 'error') {
    return 'danger';
  }
  return 'muted';
}

export function normalizeKolamDaraTrainingVisionStats(
  payload: unknown,
): KolamDaraTrainingVisionStats {
  const data = unwrapDataRecord(payload);
  const job = asRecord(data.clipIndexJob);
  const negRaw = Array.isArray(data.negativeTypes) ? data.negativeTypes : [];
  return {
    trainingPhotos: asNumber(data.trainingPhotos),
    speciesWithTraining: asNumber(data.speciesWithTraining),
    speciesReadyForTrain: asNumber(data.speciesReadyForTrain),
    feedbackTotal: asNumber(data.feedbackTotal),
    minTrainingPhotos:
      asNumber(data.minTrainingPhotos) ||
      KOLAM_DARA_TRAINING_VISION_MIN_SPECIES_PHOTOS,
    yoloModelReady: data.yoloModelReady === true,
    yoloClassCount: asNumber(data.yoloClassCount),
    clipIndexTotal: asNumber(data.clipIndexTotal),
    clipIndexClipCount: asNumber(data.clipIndexClipCount),
    clipIndexMissing: asNumber(data.clipIndexMissing),
    clipIndexJob: Object.keys(job).length
      ? {
          status: String(job.status || '').trim(),
          kind: String(job.kind || '').trim(),
          error: String(job.error || '').trim(),
        }
      : null,
    hardNegativeCount: asNumber(data.hardNegativeCount),
    feedbackPending: asNumber(data.feedbackPending),
    speciesTrainingPhotos: asNumber(
      data.speciesTrainingPhotos ?? data.trainingPhotos,
    ),
    productTrainingPhotos: asNumber(data.productTrainingPhotos),
    productsWithTraining: asNumber(data.productsWithTraining),
    closedWorldMode: data.closedWorldMode !== false,
    ocrUnifiedEnabled: data.ocrUnifiedEnabled !== false,
    ocrEngine: String(data.ocrEngine || '').trim(),
    ocrTesseractFallback: data.ocrTesseractFallback !== false,
    detectCropMode: String(data.detectCropMode || 'auto').trim(),
    detectCropModel: String(data.detectCropModel || '').trim(),
    detectCropBackend: String(data.detectCropBackend || '').trim(),
    feedbackSpeciesTotal: asNumber(data.feedbackSpeciesTotal),
    feedbackProductTotal: asNumber(data.feedbackProductTotal),
    yoloProductModelReady: data.yoloProductModelReady === true,
    yoloProductClassCount: asNumber(data.yoloProductClassCount),
    minProductTrainingPhotos:
      asNumber(data.minProductTrainingPhotos) ||
      KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
    visionLlmFallbackEnabled: data.visionLlmFallbackEnabled === true,
    visionLlmFallbackReady: data.visionLlmFallbackReady === true,
    embedModelId: String(data.embedModelId || '').trim(),
    embedFamily: String(data.embedFamily || 'siglip').trim(),
    embedMinScore:
      data.embedMinScore == null || data.embedMinScore === ''
        ? null
        : asNumber(data.embedMinScore),
    embedIndexCurrentModel: asNumber(data.embedIndexCurrentModel),
    embedIndexStale: asNumber(data.embedIndexStale),
    negativeTypes: negRaw
      .map(item => {
        const row = asRecord(item);
        const id = String(row.id || '').trim();
        if (!id) {
          return null;
        }
        return {id, label: String(row.label || id).trim()};
      })
      .filter((row): row is KolamDaraTrainingVisionIdLabel => row != null),
  };
}

export function normalizeKolamDaraTrainingVisionSpeciesList(
  payload: unknown,
): KolamDaraTrainingVisionSpeciesList {
  const root = asRecord(payload);
  const meta = asRecord(root.meta);
  const rows = listFrom(payload)
    .map(item => {
      const row = asRecord(item);
      const speciesId = String(row.speciesId || row._id || row.id || '').trim();
      if (!speciesId) {
        return null;
      }
      return {
        speciesId,
        displayName: String(row.displayName || row.commonName || '').trim() || '—',
        scientificName: String(row.scientificName || '').trim(),
        catalogPhotoCount: asNumber(row.catalogPhotoCount),
        trainingCount: asNumber(row.trainingCount),
        readyForTrain: row.readyForTrain === true,
        catalogPhotos: asStringArray(row.catalogPhotos),
      };
    })
    .filter((row): row is KolamDaraTrainingVisionSpecies => row != null);
  return {
    rows,
    page: asNumber(meta.page) || 1,
    pages: asNumber(meta.pages) || 1,
    total: asNumber(meta.total) || rows.length,
  };
}

export function normalizeKolamDaraTrainingVisionProductList(
  payload: unknown,
): KolamDaraTrainingVisionProductList {
  const root = asRecord(payload);
  const meta = asRecord(root.meta);
  const rows = listFrom(payload)
    .map(item => {
      const row = asRecord(item);
      const productId = String(row.productId || row._id || row.id || '').trim();
      if (!productId) {
        return null;
      }
      return {
        productId,
        displayName: String(row.displayName || row.name || '').trim() || '—',
        name: String(row.name || '').trim(),
        sku: String(row.sku || '').trim(),
        catalogPhotoCount: asNumber(row.catalogPhotoCount),
        trainingCount: asNumber(row.trainingCount),
        readyForIndex: row.readyForIndex === true,
        catalogPhotos: asStringArray(row.catalogPhotos),
      };
    })
    .filter((row): row is KolamDaraTrainingVisionProduct => row != null);
  return {
    rows,
    page: asNumber(meta.page) || 1,
    pages: asNumber(meta.pages) || 1,
    total: asNumber(meta.total) || rows.length,
  };
}

export function normalizeKolamDaraTrainingVisionPhotoList(
  payload: unknown,
): KolamDaraTrainingVisionPhoto[] {
  return listFrom(payload)
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      const photoKey = String(row.photoKey || '').trim();
      if (!id && !photoKey) {
        return null;
      }
      return {
        id: id || photoKey,
        photoKey,
        source: String(row.source || '').trim(),
        createdAt: String(row.createdAt || '').trim(),
      };
    })
    .filter((row): row is KolamDaraTrainingVisionPhoto => row != null);
}

export function normalizeKolamDaraTrainingVisionFeedbackList(
  payload: unknown,
): KolamDaraTrainingVisionFeedbackList {
  const root = asRecord(payload);
  const meta = asRecord(root.meta);
  const rows = listFrom(payload)
    .map(normalizeKolamDaraTrainingVisionFeedback)
    .filter((row): row is KolamDaraTrainingVisionFeedback => row != null);
  return {
    rows,
    page: asNumber(meta.page) || 1,
    pages: asNumber(meta.pages) || 1,
    total: asNumber(meta.total) || rows.length,
  };
}

export function normalizeKolamDaraTrainingVisionFeedback(
  payload: unknown,
): KolamDaraTrainingVisionFeedback | null {
  const row = asRecord(payload);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const matchRaw = String(row.matchStatus || 'unknown').trim();
  const matchStatus = (
    matchRaw in KOLAM_DARA_TRAINING_VISION_MATCH_LABELS
      ? matchRaw
      : 'unknown'
  ) as KolamDaraTrainingVisionMatchStatus;
  const kind = String(row.entityKind || '').trim();
  return {
    id,
    conversationId: String(row.conversationId || '').trim(),
    buyerImageUrl: String(row.buyerImageUrl || '').trim(),
    matchStatus,
    entityKind: kind === 'product' || kind === 'species' ? kind : '',
    suggestedDisplayName: String(row.suggestedDisplayName || '').trim(),
    correctDisplayName: String(row.correctDisplayName || '').trim(),
    correctSku: String(row.correctSku || '').trim(),
    notes: String(row.notes || '').trim(),
    inTrainingDataset: row.inTrainingDataset === true,
    createdAt: String(row.createdAt || '').trim(),
  };
}

export function normalizeKolamDaraTrainingVisionHardNegativeList(
  payload: unknown,
): KolamDaraTrainingVisionHardNegative[] {
  return listFrom(payload)
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      return {
        id,
        photoKey: String(row.photoKey || '').trim(),
        negativeType: String(row.negativeType || '').trim(),
        createdAt: String(row.createdAt || '').trim(),
      };
    })
    .filter((row): row is KolamDaraTrainingVisionHardNegative => row != null);
}

export function normalizeKolamDaraTrainingVisionFeedbackQueue(
  payload: unknown,
): KolamDaraTrainingVisionFeedbackQueueItem[] {
  return listFrom(payload)
    .map(item => {
      const row = asRecord(item);
      const id = String(row._id || row.id || '').trim();
      if (!id) {
        return null;
      }
      const kind = String(row.entityKind || '').trim();
      return {
        id,
        conversationId: String(row.conversationId || '').trim(),
        buyerImageUrl: String(row.buyerImageUrl || '').trim(),
        entityKind: kind === 'product' || kind === 'species' ? kind : '',
        correctDisplayName: String(row.correctDisplayName || '').trim(),
        correctSku: String(row.correctSku || '').trim(),
        matchStatus: String(row.matchStatus || '').trim(),
        createdAt: String(row.createdAt || '').trim(),
      };
    })
    .filter(
      (row): row is KolamDaraTrainingVisionFeedbackQueueItem => row != null,
    );
}

export function normalizeKolamDaraTrainingVisionEvalRun(
  payload: unknown,
): KolamDaraTrainingVisionEvalRun | null {
  if (payload == null) {
    return null;
  }
  const row = asRecord(
    asRecord(payload).data != null &&
      typeof asRecord(payload).data === 'object' &&
      !Array.isArray(asRecord(payload).data)
      ? asRecord(payload).data
      : payload,
  );
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  return {
    id,
    kind: String(row.kind || '').trim(),
    status: String(row.status || '').trim(),
    startedAt: String(row.startedAt || '').trim(),
    finishedAt: String(row.finishedAt || '').trim(),
    error: String(row.error || '').trim(),
    siglip: normalizeMetric(row.siglip),
    yoloSpecies: normalizeMetric(row.yoloSpecies),
    yoloProduct: normalizeMetric(row.yoloProduct),
  };
}

export function normalizeKolamDaraTrainingVisionEvalRunList(
  payload: unknown,
): KolamDaraTrainingVisionEvalRun[] {
  return listFrom(payload)
    .map(normalizeKolamDaraTrainingVisionEvalRun)
    .filter((row): row is KolamDaraTrainingVisionEvalRun => row != null);
}

export function normalizeKolamDaraTrainingVisionBaselineKpi(
  payload: unknown,
): KolamDaraTrainingVisionBaselineKpi | null {
  if (payload == null) {
    return null;
  }
  const data = unwrapDataRecord(payload);
  if (!Object.keys(data).length) {
    return null;
  }
  const inbox = asRecord(data.inbox);
  const feedback = asRecord(data.feedback);
  const precision = asRecord(data.precision);
  const latestHoldout = asRecord(data.latestHoldoutEval);
  const byMatchMethodRaw = asRecord(inbox.byMatchMethod);
  const inboxByMatchMethod = Object.entries(byMatchMethodRaw)
    .map(([method, count]) => ({
      method: String(method || '').trim(),
      count: asNumber(count),
    }))
    .filter(row => row.method.length > 0)
    .sort((a, b) => b.count - a.count);
  return {
    periodDays: asNumber(data.periodDays) || 30,
    since: String(data.since || '').trim(),
    until: String(data.until || '').trim(),
    inboxSource: String(inbox.source || '').trim(),
    inboxEventCount:
      inbox.eventCount == null || inbox.eventCount === ''
        ? null
        : asNumber(inbox.eventCount),
    inboxAutoReply: asNumber(inbox.autoReply),
    inboxVisionMatch: asNumber(inbox.visionMatch),
    inboxVisionAmbiguous: asNumber(inbox.visionAmbiguous),
    inboxVisionLlm: asNumber(inbox.visionLlm),
    inboxClarifyAbstain: asNumber(inbox.clarifyAbstain),
    inboxPayment: asNumber(inbox.payment),
    inboxSkippedDedup: asNumber(inbox.skippedDedup),
    inboxAbstainRate: asNumber(inbox.abstainRate),
    inboxAutoReplyRate: asNumber(inbox.autoReplyRate),
    inboxByMatchMethod,
    feedbackTotal: asNumber(feedback.total),
    feedbackFalseMatch: asNumber(feedback.falseMatch),
    feedbackFalseMatchRate: asNumber(feedback.falseMatchRate),
    precisionPct:
      precision.estimatedPrecisionPct == null ||
      precision.estimatedPrecisionPct === ''
        ? null
        : asNumber(precision.estimatedPrecisionPct),
    precisionNote: String(precision.note || '').trim(),
    latestHoldoutSiglipAccuracy:
      latestHoldout.siglipAccuracy == null ||
      latestHoldout.siglipAccuracy === ''
        ? null
        : asNumber(latestHoldout.siglipAccuracy),
  };
}

export function normalizeKolamDaraTrainingVisionActionResult(
  payload: unknown,
): KolamDaraTrainingVisionActionResult {
  const root = asRecord(payload);
  return {
    success: root.success !== false,
    message: String(root.message || '').trim(),
  };
}

export function formatKolamDaraTrainingVisionDateTime(iso?: string | null) {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
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

function normalizeMetric(value: unknown): KolamDaraTrainingVisionEvalMetric | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const row = asRecord(value);
  return {
    total: asNumber(row.total),
    correct: asNumber(row.correct),
    accuracy: asNumber(row.accuracy),
    error: String(row.error || '').trim(),
  };
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
