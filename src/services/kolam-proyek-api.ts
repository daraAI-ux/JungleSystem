import { appConfig } from '../config/app';
import {
  normalizeKolamProyekDetail,
  normalizeKolamProyekList,
  type KolamProyekDetail,
  type KolamProyekListQuery,
  type KolamProyekListResult,
} from '../domain/kolam-proyek';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export type KolamCustomProjectOption = {
  id: string;
  label: string;
  quotationNumber: string;
};

/** Thin picker options for Task Manager (existing consumers). */
export async function getKolamCustomProjectOptions({
  limit = 200,
  page = 1,
}: {
  limit?: number;
  page?: number;
} = {}): Promise<KolamCustomProjectOption[]> {
  const list = await getKolamProyekList({ limit, page });
  return list.items.map(item => ({
    id: item.id,
    label: item.quotationNumber || item.clientName || item.id,
    quotationNumber: item.quotationNumber,
  }));
}

export async function getKolamProyekList(
  query: KolamProyekListQuery = {},
): Promise<KolamProyekListResult> {
  const payload = await kolamRequest<unknown>('/custom-project', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 50,
      ...(query.lifecycleStatus
        ? { lifecycleStatus: query.lifecycleStatus }
        : {}),
      ...(query.customer?.trim() ? { customer: query.customer.trim() } : {}),
    },
  });
  return normalizeKolamProyekList(payload, query);
}

export async function getKolamProyek(
  ref: string,
): Promise<KolamProyekDetail> {
  const id = String(ref || '').trim();
  if (!id) {
    throw new Error('Proyek tidak ditemukan.');
  }
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}`,
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Proyek tidak ditemukan.');
  }
  return detail;
}

/** P0 stub — used by P2 quotation create. */
export async function createKolamProyekQuotation(
  body: Record<string, unknown>,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>('/custom-project/quotations', {
    method: 'POST',
    body,
  });
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal membuat surat penawaran.');
  }
  return detail;
}

/** P0 stub — used by P2 quotation draft update. */
export async function updateKolamProyekQuotation(
  id: string,
  body: Record<string, unknown>,
): Promise<KolamProyekDetail> {
  const payload = await kolamRequest<unknown>(
    `/custom-project/${encodeURIComponent(id)}/quotation`,
    {
      method: 'PATCH',
      body,
    },
  );
  const detail = normalizeKolamProyekDetail(payload);
  if (!detail) {
    throw new Error('Gagal memperbarui surat penawaran.');
  }
  return detail;
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
    body?: unknown;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}
