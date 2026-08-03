import { appConfig } from '../config/app';
import {
  normalizeKolamCampaignList,
  type KolamCampaignListQuery,
  type KolamCampaignListResult,
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

/** DELETE /campaign/:id — FE `useDeleteCampaign`. */
export async function deleteKolamCampaign(id: string): Promise<void> {
  await kolamRequest<unknown>(`/campaign/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
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
