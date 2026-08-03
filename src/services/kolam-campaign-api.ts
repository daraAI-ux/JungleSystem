import { appConfig } from '../config/app';
import {
  normalizeKolamCampaign,
  normalizeKolamCampaignList,
  type KolamCampaign,
  type KolamCampaignListQuery,
  type KolamCampaignListResult,
  type KolamCampaignSaveBody,
} from '../domain/kolam-campaign';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

/** GET /campaign — FE `useGetCampaigns`. */
export async function getKolamCampaigns(
  query: KolamCampaignListQuery = {},
): Promise<KolamCampaignListResult> {
  const payload = await kolamRequest<unknown>('/campaign', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
  });
  return normalizeKolamCampaignList(payload, query);
}

/** GET /campaign/:id — FE `useGetCampaign` / server detail. */
export async function getKolamCampaign(id: string): Promise<KolamCampaign> {
  const payload = await kolamRequest<unknown>(
    `/campaign/${encodeURIComponent(id)}`,
  );
  return normalizeKolamCampaign(payload);
}

/** POST /campaign — FE `useCreateCampaign`. */
export async function createKolamCampaign(
  body: KolamCampaignSaveBody,
): Promise<KolamCampaign> {
  const payload = await kolamRequest<unknown>('/campaign', {
    method: 'POST',
    body,
  });
  return normalizeKolamCampaign(unwrapData(payload));
}

/** PUT /campaign/:id — FE `useUpdateCampaign`. */
export async function updateKolamCampaign(
  id: string,
  body: KolamCampaignSaveBody,
): Promise<KolamCampaign> {
  const payload = await kolamRequest<unknown>(
    `/campaign/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamCampaign(unwrapData(payload));
}

/** DELETE /campaign/:id — FE `useDeleteCampaign`. */
export async function deleteKolamCampaign(id: string): Promise<void> {
  await kolamRequest<unknown>(`/campaign/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

function unwrapData(payload: unknown): unknown {
  const record =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : null;
  if (record && 'data' in record && record.data != null) {
    return record.data;
  }
  return payload;
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
  } = {},
) {
  return apiRequest<T | DataResponse<T>>({
    method: options.method ?? 'GET',
    path,
    body: options.body,
    query: options.query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  }) as Promise<T>;
}
