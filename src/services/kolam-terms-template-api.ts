import { appConfig } from '../config/app';
import {
  normalizeKolamTermsTemplate,
  normalizeKolamTermsTemplateList,
  type KolamTermsTemplate,
  type KolamTermsTemplateListQuery,
  type KolamTermsTemplateListResult,
  type KolamTermsTemplateStatus,
} from '../domain/kolam-terms-template';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamTermsTemplates(
  query: KolamTermsTemplateListQuery = {},
): Promise<KolamTermsTemplateListResult> {
  const payload = await kolamRequest<unknown>('/terms-templates', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 50,
      ...(query.q?.trim() ? { q: query.q.trim() } : {}),
      ...(query.status ? { status: query.status } : {}),
    },
  });
  return normalizeKolamTermsTemplateList(payload, query);
}

export async function getKolamTermsTemplate(
  id: string,
): Promise<KolamTermsTemplate> {
  const payload = await kolamRequest<unknown>(
    `/terms-templates/${encodeURIComponent(id)}`,
  );
  return normalizeKolamTermsTemplate(payload);
}

export async function setKolamTermsTemplateStatus(
  id: string,
  status: KolamTermsTemplateStatus,
): Promise<KolamTermsTemplate> {
  const payload = await kolamRequest<unknown>(
    `/terms-templates/${encodeURIComponent(id)}/status`,
    {
      method: 'PATCH',
      body: { status },
    },
  );
  return normalizeKolamTermsTemplate(payload);
}

/** Soft-archive (BE DELETE → status archived). */
export async function archiveKolamTermsTemplate(
  id: string,
): Promise<KolamTermsTemplate> {
  const payload = await kolamRequest<unknown>(
    `/terms-templates/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
  return normalizeKolamTermsTemplate(payload);
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
