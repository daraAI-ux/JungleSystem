import {appConfig} from '../config/app';
import {getKolamFileUrl} from '../lib/file-url';
import {
  normalizeKolamDaraTrainingVisionActionResult,
  normalizeKolamDaraTrainingVisionBaselineKpi,
  normalizeKolamDaraTrainingVisionEvalRun,
  normalizeKolamDaraTrainingVisionEvalRunList,
  normalizeKolamDaraTrainingVisionFeedbackList,
  normalizeKolamDaraTrainingVisionFeedbackQueue,
  normalizeKolamDaraTrainingVisionHardNegativeList,
  normalizeKolamDaraTrainingVisionPhotoList,
  KOLAM_DARA_TRAINING_VISION_LIST_PAGE_SIZE,
  normalizeKolamDaraTrainingVisionProductList,
  normalizeKolamDaraTrainingVisionSpeciesList,
  normalizeKolamDaraTrainingVisionStats,
  type KolamDaraTrainingVisionActionResult,
  type KolamDaraTrainingVisionBaselineKpi,
  type KolamDaraTrainingVisionEvalRun,
  type KolamDaraTrainingVisionFeedbackKind,
  type KolamDaraTrainingVisionFeedbackList,
  type KolamDaraTrainingVisionFeedbackQueueItem,
  type KolamDaraTrainingVisionHardNegative,
  type KolamDaraTrainingVisionPhoto,
  type KolamDaraTrainingVisionProductList,
  type KolamDaraTrainingVisionSpeciesList,
  type KolamDaraTrainingVisionStats,
} from '../domain/kolam-dara-training-vision';
import {apiRequest} from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;

interface DataResponse<T> {
  data: T;
}

/** GET /dara-training/vision/stats */
export async function fetchKolamDaraTrainingVisionStats(): Promise<KolamDaraTrainingVisionStats> {
  const payload = await kolamRequest<unknown>('/dara-training/vision/stats');
  return normalizeKolamDaraTrainingVisionStats(payload);
}

/** GET /dara-training/vision/species */
export async function listKolamDaraTrainingVisionSpecies(opts?: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<KolamDaraTrainingVisionSpeciesList> {
  const payload = await kolamRequest<unknown>('/dara-training/vision/species', {
    query: {
      page: opts?.page ?? 1,
      limit: opts?.limit ?? KOLAM_DARA_TRAINING_VISION_LIST_PAGE_SIZE,
      q: opts?.q || undefined,
    },
  });
  return normalizeKolamDaraTrainingVisionSpeciesList(payload);
}

/** GET /dara-training/vision/products */
export async function listKolamDaraTrainingVisionProducts(opts?: {
  page?: number;
  limit?: number;
  q?: string;
}): Promise<KolamDaraTrainingVisionProductList> {
  const payload = await kolamRequest<unknown>('/dara-training/vision/products', {
    query: {
      page: opts?.page ?? 1,
      limit: opts?.limit ?? KOLAM_DARA_TRAINING_VISION_LIST_PAGE_SIZE,
      q: opts?.q || undefined,
    },
  });
  return normalizeKolamDaraTrainingVisionProductList(payload);
}

/** GET /dara-training/vision/feedback */
export async function listKolamDaraTrainingVisionFeedback(opts?: {
  page?: number;
  limit?: number;
  q?: string;
  entityKind?: KolamDaraTrainingVisionFeedbackKind;
}): Promise<KolamDaraTrainingVisionFeedbackList> {
  const kind = opts?.entityKind ?? 'all';
  const payload = await kolamRequest<unknown>('/dara-training/vision/feedback', {
    query: {
      page: opts?.page ?? 1,
      limit: opts?.limit ?? 20,
      q: opts?.q || undefined,
      entityKind: kind === 'all' ? undefined : kind,
    },
  });
  return normalizeKolamDaraTrainingVisionFeedbackList(payload);
}

/** GET /dara-training/vision/species/:id/photos */
export async function listKolamDaraTrainingVisionSpeciesPhotos(
  speciesId: string,
): Promise<KolamDaraTrainingVisionPhoto[]> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/vision/species/${encodeURIComponent(speciesId)}/photos`,
  );
  return normalizeKolamDaraTrainingVisionPhotoList(payload);
}

/** GET /dara-training/vision/products/:id/photos */
export async function listKolamDaraTrainingVisionProductPhotos(
  productId: string,
): Promise<KolamDaraTrainingVisionPhoto[]> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/vision/products/${encodeURIComponent(productId)}/photos`,
  );
  return normalizeKolamDaraTrainingVisionPhotoList(payload);
}

/** POST /dara-training/vision/species/:id/photos */
export async function addKolamDaraTrainingVisionSpeciesPhoto(
  speciesId: string,
  body: {photoKey: string; source?: string; notes?: string},
): Promise<void> {
  await kolamRequest(
    `/dara-training/vision/species/${encodeURIComponent(speciesId)}/photos`,
    {method: 'POST', body},
  );
}

/** POST /dara-training/vision/products/:id/photos */
export async function addKolamDaraTrainingVisionProductPhoto(
  productId: string,
  body: {photoKey: string; source?: string; notes?: string},
): Promise<void> {
  await kolamRequest(
    `/dara-training/vision/products/${encodeURIComponent(productId)}/photos`,
    {method: 'POST', body},
  );
}

/** DELETE /dara-training/vision/photos/:id */
export async function deleteKolamDaraTrainingVisionPhoto(
  photoId: string,
): Promise<void> {
  await kolamRequest(
    `/dara-training/vision/photos/${encodeURIComponent(photoId)}`,
    {method: 'DELETE'},
  );
}

/** POST /dara-training/vision/import-feedback */
export async function importKolamDaraTrainingVisionFeedback(
  limit = 200,
): Promise<{scanned: number; imported: number}> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/import-feedback',
    {method: 'POST', body: {limit}},
  );
  const root =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === 'object' && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;
  return {
    scanned: Number(data.scanned) || 0,
    imported: Number(data.imported) || 0,
  };
}

/** POST /dara-training/vision/export-yolo */
export async function exportKolamDaraTrainingVisionYolo(
  minPhotos?: number,
): Promise<KolamDaraTrainingVisionActionResult> {
  const payload = await kolamRequest<unknown>('/dara-training/vision/export-yolo', {
    method: 'POST',
    body: {minPhotos},
  });
  return normalizeKolamDaraTrainingVisionActionResult(payload);
}

/** POST /dara-training/vision/train-yolo */
export async function trainKolamDaraTrainingVisionYolo(opts?: {
  poc?: boolean;
  epochs?: number;
}): Promise<KolamDaraTrainingVisionActionResult> {
  const payload = await kolamRequest<unknown>('/dara-training/vision/train-yolo', {
    method: 'POST',
    body: opts ?? {poc: true, epochs: 5},
  });
  return normalizeKolamDaraTrainingVisionActionResult(payload);
}

/** POST /dara-training/vision/export-yolo-products */
export async function exportKolamDaraTrainingVisionYoloProducts(
  minPhotos?: number,
): Promise<KolamDaraTrainingVisionActionResult> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/export-yolo-products',
    {method: 'POST', body: {minPhotos}},
  );
  return normalizeKolamDaraTrainingVisionActionResult(payload);
}

/** POST /dara-training/vision/train-yolo-products */
export async function trainKolamDaraTrainingVisionYoloProducts(opts?: {
  poc?: boolean;
  epochs?: number;
}): Promise<KolamDaraTrainingVisionActionResult> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/train-yolo-products',
    {method: 'POST', body: opts ?? {poc: true, epochs: 5}},
  );
  return normalizeKolamDaraTrainingVisionActionResult(payload);
}

/** POST /dara-training/vision/rebuild-clip-index */
export async function rebuildKolamDaraTrainingVisionClipIndex(opts?: {
  includeProducts?: boolean;
}): Promise<KolamDaraTrainingVisionActionResult> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/rebuild-clip-index',
    {
      method: 'POST',
      body:
        opts?.includeProducts === false
          ? {includeProducts: false}
          : {includeProducts: true},
    },
  );
  return normalizeKolamDaraTrainingVisionActionResult(payload);
}

/** POST /dara-training/vision/backfill-clip */
export async function backfillKolamDaraTrainingVisionClip(
  limit?: number,
): Promise<KolamDaraTrainingVisionActionResult> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/backfill-clip',
    {method: 'POST', body: limit ? {limit} : {}},
  );
  return normalizeKolamDaraTrainingVisionActionResult(payload);
}

/** GET /dara-training/vision/hard-negatives */
export async function listKolamDaraTrainingVisionHardNegatives(): Promise<
  KolamDaraTrainingVisionHardNegative[]
> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/hard-negatives',
  );
  return normalizeKolamDaraTrainingVisionHardNegativeList(payload);
}

/** POST /dara-training/vision/hard-negatives */
export async function addKolamDaraTrainingVisionHardNegative(body: {
  photoKey: string;
  negativeType?: string;
  notes?: string;
}): Promise<void> {
  await kolamRequest('/dara-training/vision/hard-negatives', {
    method: 'POST',
    body,
  });
}

/** GET /dara-training/vision/feedback-queue */
export async function listKolamDaraTrainingVisionFeedbackQueue(
  limit = 30,
): Promise<KolamDaraTrainingVisionFeedbackQueueItem[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/feedback-queue',
    {query: {limit}},
  );
  return normalizeKolamDaraTrainingVisionFeedbackQueue(payload);
}

/** POST /dara-training/vision/feedback-queue/:id/import */
export async function importKolamDaraTrainingVisionFeedbackQueueItem(
  feedbackId: string,
): Promise<KolamDaraTrainingVisionActionResult> {
  const payload = await kolamRequest<unknown>(
    `/dara-training/vision/feedback-queue/${encodeURIComponent(feedbackId)}/import`,
    {method: 'POST'},
  );
  return normalizeKolamDaraTrainingVisionActionResult(payload);
}

/** POST /dara-training/vision/eval-yolo */
export async function evalKolamDaraTrainingVisionYolo(): Promise<KolamDaraTrainingVisionActionResult> {
  const payload = await kolamRequest<unknown>('/dara-training/vision/eval-yolo', {
    method: 'POST',
  });
  return normalizeKolamDaraTrainingVisionActionResult(payload);
}

/** POST /dara-training/vision/eval-holdout */
export async function runKolamDaraTrainingVisionHoldoutEval(opts?: {
  holdoutRatio?: number;
  includeProducts?: boolean;
}): Promise<KolamDaraTrainingVisionEvalRun | null> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/eval-holdout',
    {method: 'POST', body: opts ?? {}},
  );
  return normalizeKolamDaraTrainingVisionEvalRun(payload);
}

/** GET /dara-training/vision/eval-runs */
export async function listKolamDaraTrainingVisionEvalRuns(
  limit = 8,
): Promise<KolamDaraTrainingVisionEvalRun[]> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/eval-runs',
    {query: {limit}},
  );
  return normalizeKolamDaraTrainingVisionEvalRunList(payload);
}

/** GET /dara-training/vision/eval-runs/latest */
export async function fetchKolamDaraTrainingVisionLatestEvalRun(): Promise<KolamDaraTrainingVisionEvalRun | null> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/eval-runs/latest',
  );
  return normalizeKolamDaraTrainingVisionEvalRun(payload);
}

/** GET /dara-training/vision/baseline-kpi */
export async function fetchKolamDaraTrainingVisionBaselineKpi(
  days = 30,
): Promise<KolamDaraTrainingVisionBaselineKpi | null> {
  const payload = await kolamRequest<unknown>(
    '/dara-training/vision/baseline-kpi',
    {query: {days}},
  );
  return normalizeKolamDaraTrainingVisionBaselineKpi(payload);
}

/** Resolve media path like FE `getFileUrl` (host root, not `/api`). */
export function resolveKolamDaraTrainingVisionImageUri(
  raw?: string | null,
): string | null {
  return getKolamFileUrl(raw);
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, QueryValue>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
  });
}
