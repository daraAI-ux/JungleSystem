import {appConfig} from '../config/app';
import {
  type KolamMediaFilter,
  type KolamMediaType,
} from '../domain/kolam-media';
import {apiRequest} from '../lib/api-client';

export interface KolamMediaOwner {
  id?: string;
  name?: string;
  type: string;
}

export interface KolamMediaItem {
  alt?: string;
  filename: string;
  isOrphan: boolean;
  owners: KolamMediaOwner[];
  path: string;
  title?: string;
  type: KolamMediaType;
  url?: string;
}

export interface KolamMediaListQuery {
  filter?: KolamMediaFilter;
  limit?: number;
  page?: number;
  search?: string;
  type?: KolamMediaType;
}

export interface KolamMediaListResult {
  items: KolamMediaItem[];
  page: number;
  total: number;
  totalPages: number;
}

type QueryValue = string | number | boolean | undefined | null;

export async function getKolamMediaList({
  filter = 'all',
  limit = 48,
  page = 1,
  search = '',
  type = 'image',
}: KolamMediaListQuery = {}): Promise<KolamMediaListResult> {
  const response = await kolamMediaRequest<unknown>('/media/list', {
    filter,
    limit,
    page,
    search: search.trim() || undefined,
    type,
  });

  return normalizeKolamMediaList(response, {page, type});
}

export async function getKolamMediaOrphanFilenames(
  type: KolamMediaType,
): Promise<string[]> {
  const response = await kolamMediaRequest<unknown>('/media/orphan-filenames', {
    type,
  });
  const value = unwrapData(response);

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (isRecord(value) && Array.isArray(value.filenames)) {
    return value.filenames.filter(
      (item): item is string => typeof item === 'string',
    );
  }

  return [];
}

async function kolamMediaRequest<T>(
  path: string,
  query?: Record<string, QueryValue>,
) {
  return apiRequest<T>({
    method: 'GET',
    path,
    query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function normalizeKolamMediaList(
  response: unknown,
  fallback: Pick<KolamMediaListQuery, 'page' | 'type'>,
): KolamMediaListResult {
  const value = unwrapData(response);
  const itemsValue = getListItems(value);
  const items = itemsValue
    .map(item => normalizeKolamMediaItem(item, fallback.type ?? 'image'))
    .filter((item): item is KolamMediaItem => item !== null);
  const source = isRecord(value) ? value : {};
  const total = getNumber(source.total, items.length);
  const page = getNumber(source.page ?? source.currentPage, fallback.page ?? 1);
  const totalPages = getNumber(
    source.totalPages ?? source.pages,
    Math.max(1, Math.ceil(total / Math.max(1, items.length || 48))),
  );

  return {items, page, total, totalPages};
}

function normalizeKolamMediaItem(
  value: unknown,
  fallbackType: KolamMediaType,
): KolamMediaItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const filename = getString(value.filename ?? value.name);
  const path = getString(value.path ?? value.url ?? filename);

  if (!filename || !path) {
    return null;
  }

  return {
    alt: getOptionalString(value.alt),
    filename,
    isOrphan: Boolean(value.isOrphan ?? value.orphan),
    owners: normalizeOwners(value.owners),
    path,
    title: getOptionalString(value.title),
    type: value.type === 'video' ? 'video' : fallbackType,
    url: getOptionalString(value.url),
  };
}

function normalizeOwners(value: unknown): KolamMediaOwner[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const owners: KolamMediaOwner[] = [];

  value.forEach(owner => {
    if (!isRecord(owner)) {
      return;
    }

    const type = getString(owner.type);
    if (!type) {
      return;
    }

    owners.push({
      id: getOptionalString(owner.id),
      name: getOptionalString(owner.name ?? owner.label ?? owner.title),
      type,
    });
  });

  return owners;
}

function getListItems(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of ['items', 'media', 'data', 'results', 'files']) {
    const nextValue = value[key];
    if (Array.isArray(nextValue)) {
      return nextValue;
    }
  }

  return [];
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && 'data' in value && !Array.isArray(value.data)) {
    return value.data;
  }
  return value;
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getOptionalString(value: unknown): string | undefined {
  const text = getString(value);
  return text || undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
