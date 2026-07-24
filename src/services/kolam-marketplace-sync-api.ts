import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

export type KolamMarketplacePlatform = 'tokopedia' | 'shopee';
export type KolamMarketplaceSyncSource = 'products' | 'species';
export type KolamMarketplaceTaskStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled';

export interface KolamMarketplaceSyncTaskResult {
  failed?: number;
  items?: Array<{
    error?: string;
    productName?: string;
    sku: string;
    status: string;
  }>;
  notFound?: number;
  skipped?: number;
  synced?: number;
  total?: number;
}

export interface KolamMarketplaceSyncTaskProgress {
  latest?: {
    error?: string | null;
    sku?: string;
    status?: string;
  } | null;
  processed?: number;
  total?: number;
}

export interface KolamMarketplaceSyncTask {
  _id: string;
  completedAt?: string | null;
  error?: string | null;
  payload?: {
    items?: Array<{ newPrice?: number; newStock?: number; sku: string }>;
    platform?: KolamMarketplacePlatform;
  };
  progress?: KolamMarketplaceSyncTaskProgress | null;
  result?: KolamMarketplaceSyncTaskResult | null;
  serviceAccountId?: { platform?: string } | null;
  startedAt?: string | null;
  status: KolamMarketplaceTaskStatus;
  type?: string;
}

export type KolamMarketplacePriceSyncTaskResult = KolamMarketplaceSyncTaskResult;
export type KolamMarketplacePriceSyncTaskProgress = KolamMarketplaceSyncTaskProgress;
export type KolamMarketplacePriceSyncTask = KolamMarketplaceSyncTask;

export interface KolamMarketplaceSyncResult {
  message: string;
  perPlatform: Record<
    KolamMarketplacePlatform,
    {
      error: string | null;
      itemCount: number;
      success: boolean;
      taskId: string | null;
    }
  >;
  skippedNoPrice?: number;
  skippedNoSku?: number;
  totalItems: number;
}

export type KolamMarketplacePriceSyncResult = KolamMarketplaceSyncResult;

interface SyncResponse {
  message?: string;
  data?: {
    perPlatform?: Partial<
      Record<
        KolamMarketplacePlatform,
        {
          error?: string | null;
          itemCount?: number;
          success?: boolean;
          taskId?: string | null;
        }
      >
    >;
    skippedNoPrice?: number;
    skippedNoSku?: number;
    totalItems?: number;
  };
}

interface ActiveTasksResponse {
  data?: KolamMarketplaceSyncTask[];
  success?: boolean;
}

interface TaskResponse {
  data?: KolamMarketplaceSyncTask;
  success?: boolean;
}

export async function syncKolamMarketplacePrice(options: {
  onlySkus?: string[];
  platforms?: KolamMarketplacePlatform[];
  productIds?: string[];
  source?: KolamMarketplaceSyncSource;
  speciesIds?: string[];
} = {}): Promise<KolamMarketplaceSyncResult> {
  return syncKolamMarketplace('/marketplace/sync-price', options);
}

export async function syncKolamMarketplaceStock(options: {
  onlySkus?: string[];
  platforms?: KolamMarketplacePlatform[];
  productIds?: string[];
  source?: KolamMarketplaceSyncSource;
  speciesIds?: string[];
} = {}): Promise<KolamMarketplaceSyncResult> {
  return syncKolamMarketplace('/marketplace/sync-stock', options);
}

export async function getKolamMarketplacePriceSyncActiveTasks(): Promise<
  KolamMarketplaceSyncTask[]
> {
  return getKolamMarketplaceActiveTasks('/marketplace/sync-price/active');
}

export async function getKolamMarketplaceStockSyncActiveTasks(): Promise<
  KolamMarketplaceSyncTask[]
> {
  return getKolamMarketplaceActiveTasks('/marketplace/sync-stock/active');
}

export async function getKolamMarketplaceTask(
  taskId: string,
): Promise<KolamMarketplaceSyncTask | null> {
  const response = await apiRequest<TaskResponse>({
    method: 'GET',
    path: `/marketplace/task/${encodeURIComponent(taskId)}`,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return response.data ?? null;
}

export async function cancelKolamMarketplaceTask(taskId: string): Promise<void> {
  await apiRequest<unknown>({
    method: 'POST',
    path: `/marketplace/task/${encodeURIComponent(taskId)}/cancel`,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

async function syncKolamMarketplace(
  path: '/marketplace/sync-price' | '/marketplace/sync-stock',
  options: {
    onlySkus?: string[];
    platforms?: KolamMarketplacePlatform[];
    productIds?: string[];
    source?: KolamMarketplaceSyncSource;
    speciesIds?: string[];
  },
) {
  const response = await apiRequest<SyncResponse>({
    method: 'POST',
    path,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
    body: {
      onlySkus: normalizeStringList(options.onlySkus),
      platforms: options.platforms ?? ['tokopedia', 'shopee'],
      productIds: normalizeStringList(options.productIds),
      source: options.source,
      speciesIds: normalizeStringList(options.speciesIds),
    },
  });

  return {
    message: response.message ?? 'Sinkron marketplace berhasil dimasukkan antrean.',
    perPlatform: {
      tokopedia: normalizePlatformResult(response.data?.perPlatform?.tokopedia),
      shopee: normalizePlatformResult(response.data?.perPlatform?.shopee),
    },
    skippedNoPrice: Number(response.data?.skippedNoPrice ?? 0),
    skippedNoSku: Number(response.data?.skippedNoSku ?? 0),
    totalItems: Number(response.data?.totalItems ?? 0),
  };
}

async function getKolamMarketplaceActiveTasks(path: string) {
  const response = await apiRequest<ActiveTasksResponse>({
    method: 'GET',
    path,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });

  return Array.isArray(response.data) ? response.data : [];
}

function normalizeStringList(values?: string[]) {
  const cleanValues = (values ?? [])
    .map(value => value.trim())
    .filter(Boolean);

  return cleanValues.length ? cleanValues : undefined;
}

function normalizePlatformResult(
  value:
    | {
        error?: string | null;
        itemCount?: number;
        success?: boolean;
        taskId?: string | null;
      }
    | undefined,
) {
  return {
    error: value?.error ?? null,
    itemCount: Number(value?.itemCount ?? 0),
    success: Boolean(value?.success),
    taskId: value?.taskId ?? null,
  };
}
