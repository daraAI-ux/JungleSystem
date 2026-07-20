import { appConfig } from '../config/app';
import {
  createKolamTaxonomyCreatePayload,
  createKolamTaxonomyUpdatePayload,
  normalizeKolamTaxonomyDetail,
  normalizeKolamTaxonomyList,
  type KolamTaxonomy,
  type KolamTaxonomyFormState,
  type KolamTaxonomyLevel,
} from '../domain/kolam-taxonomy';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamTaxonomies(options: {
  includeChildren?: boolean;
  level?: KolamTaxonomyLevel;
  limit?: number;
  page?: number;
  parent?: string;
  rootOnly?: boolean;
  search?: string;
} = {}): Promise<KolamTaxonomy[]> {
  const response = await kolamRequest<unknown>('/taxonomy', {
    query: {
      includeChildren: options.includeChildren,
      level: options.level,
      limit: options.limit ?? 1000,
      page: options.page ?? 1,
      parent: options.parent,
      rootOnly: options.rootOnly,
      search: options.search,
    },
  });

  return normalizeKolamTaxonomyList(response);
}

export async function getKolamTaxonomy(id: string): Promise<KolamTaxonomy> {
  const response = await kolamRequest<unknown>(
    `/taxonomy/${encodeURIComponent(id)}`,
    {
      query: {
        includeAncestors: true,
        includeChildren: true,
      },
    },
  );
  return normalizeKolamTaxonomyDetail(response);
}

export async function createKolamTaxonomy(
  form: KolamTaxonomyFormState,
): Promise<KolamTaxonomy> {
  const response = await kolamRequest<unknown>('/taxonomy', {
    method: 'POST',
    body: createKolamTaxonomyCreatePayload(form),
  });

  return normalizeKolamTaxonomyDetail(response);
}

export async function updateKolamTaxonomy(
  id: string,
  form: KolamTaxonomyFormState,
): Promise<KolamTaxonomy> {
  const response = await kolamRequest<unknown>(
    `/taxonomy/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body: createKolamTaxonomyUpdatePayload(form),
    },
  );

  return normalizeKolamTaxonomyDetail(response);
}

export async function deleteKolamTaxonomy(id: string): Promise<void> {
  await kolamRequest<unknown>(`/taxonomy/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
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
