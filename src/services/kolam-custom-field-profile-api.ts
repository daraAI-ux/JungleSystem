import { appConfig } from '../config/app';
import {
  normalizeKolamCustomFieldProfileList,
  type KolamCustomFieldProfile,
  type KolamCustomFieldProfileScope,
  type KolamCustomFieldProfileStatus,
} from '../domain/kolam-custom-field-profile';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamCustomFieldProfiles({
  scope,
  status,
}: {
  scope?: KolamCustomFieldProfileScope;
  status?: KolamCustomFieldProfileStatus;
} = {}): Promise<KolamCustomFieldProfile[]> {
  const response = await kolamRequest<unknown>('/custom-field-profiles', {
    query: {
      scope,
      status,
      limit: 100,
      page: 1,
    },
  });

  return normalizeKolamCustomFieldProfileList(response);
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
