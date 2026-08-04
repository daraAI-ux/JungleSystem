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

export interface KolamMediaOrphanUnsafeEntry {
  filename: string;
  foundIn: string[];
}

export interface KolamMediaOrphanCheckResult {
  safe: string[];
  scanned: number;
  unsafe: KolamMediaOrphanUnsafeEntry[];
}

export interface KolamMediaOrphanCleanupResult {
  deleted: number;
  failed: Array<{filename: string; error: string}>;
  forced: boolean;
  skippedUnsafe: number;
  unsafe: KolamMediaOrphanUnsafeEntry[];
}

type QueryValue = string | number | boolean | undefined | null;
type KolamMediaRequestOptions = {
  body?: unknown;
  method?: 'GET' | 'POST';
  query?: Record<string, QueryValue>;
};

export async function getKolamMediaList({
  filter = 'all',
  limit = 48,
  page = 1,
  search = '',
  type = 'image',
}: KolamMediaListQuery = {}): Promise<KolamMediaListResult> {
  const response = await kolamMediaRequest<unknown>('/media/list', {
    query: {
      filter,
      limit,
      page,
      search: search.trim() || undefined,
      type,
    },
  });

  return normalizeKolamMediaList(response, {page, type});
}

export async function getKolamMediaOrphanFilenames(
  type: KolamMediaType,
): Promise<string[]> {
  const response = await kolamMediaRequest<unknown>('/media/orphan-filenames', {
    query: {type},
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

export async function checkKolamMediaOrphans(
  filenames: string[],
): Promise<KolamMediaOrphanCheckResult> {
  const response = await kolamMediaRequest<unknown>('/media/orphan/check', {
    method: 'POST',
    body: {filenames},
  });
  const value = unwrapData(response);

  if (!isRecord(value)) {
    return {safe: [], scanned: 0, unsafe: []};
  }

  return {
    safe: normalizeStringList(value.safe),
    scanned: getNumber(value.scanned, filenames.length),
    unsafe: normalizeUnsafeEntries(value.unsafe),
  };
}

export async function cleanupKolamMediaOrphans({
  filenames,
  force = false,
}: {
  filenames: string[];
  force?: boolean;
}): Promise<KolamMediaOrphanCleanupResult> {
  const response = await kolamMediaRequest<unknown>('/media/orphan/cleanup', {
    method: 'POST',
    body: {filenames, force},
  });
  const value = unwrapData(response);

  if (!isRecord(value)) {
    return {
      deleted: 0,
      failed: [],
      forced: force,
      skippedUnsafe: 0,
      unsafe: [],
    };
  }

  return {
    deleted: getNumber(value.deleted, 0),
    failed: normalizeFailedEntries(value.failed),
    forced: Boolean(value.forced),
    skippedUnsafe: getNumber(value.skippedUnsafe, 0),
    unsafe: normalizeUnsafeEntries(value.unsafe),
  };
}

async function kolamMediaRequest<T>(
  path: string,
  options: KolamMediaRequestOptions = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
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

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function normalizeUnsafeEntries(value: unknown): KolamMediaOrphanUnsafeEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(entry => {
      if (!isRecord(entry)) {
        return null;
      }

      const filename = getString(entry.filename);
      if (!filename) {
        return null;
      }

      return {
        filename,
        foundIn: normalizeStringList(entry.foundIn),
      };
    })
    .filter((entry): entry is KolamMediaOrphanUnsafeEntry => entry !== null);
}

function normalizeFailedEntries(
  value: unknown,
): Array<{filename: string; error: string}> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(entry => {
      if (!isRecord(entry)) {
        return null;
      }

      const filename = getString(entry.filename);
      if (!filename) {
        return null;
      }

      return {
        filename,
        error: getString(entry.error) || 'Gagal',
      };
    })
    .filter((entry): entry is {filename: string; error: string} => entry !== null);
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
