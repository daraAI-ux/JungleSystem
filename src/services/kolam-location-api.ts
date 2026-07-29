import { appConfig } from '../config/app';
import type {
  KolamLocationTier,
  KolamLocationType,
} from '../domain/kolam-location';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export interface KolamLocationOption {
  id: string;
  name: string;
  label: string;
  type: KolamLocationType | string;
  tier: KolamLocationTier | string;
}

export type KolamLocationListTypeFilter = KolamLocationType;
export type KolamLocationListTierFilter = KolamLocationTier;

export interface KolamLocationParentRef {
  id: string;
  name: string;
  type: KolamLocationType | string;
  tier: KolamLocationTier | string;
}

export interface KolamLocationListItem {
  id: string;
  name: string;
  type: string;
  tier: string;
  parent: KolamLocationParentRef | null;
  description: string;
  address: string;
  capacitySlots: number | null;
  children?: KolamLocationListItem[];
  mapsUrl: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface KolamLocationDetailItem extends KolamLocationListItem {
  children: KolamLocationListItem[];
  secondary: KolamLocationListItem[];
  tertiary: KolamLocationListItem[];
}

export interface KolamLocationProductRow {
  id: string;
  name: string;
  sku: string;
  sellable: boolean | null;
  stock: number;
  status: string;
  thumbnailImage: string;
  type: string;
}

export interface KolamLocationEnclosureRow {
  id: string;
  code: string;
  name: string;
  type: string;
  assignedToName: string;
  coverPhotoUrl: string;
  status: string;
}

export interface KolamLocationAssetRow {
  id: string;
  code: string;
  name: string;
  purchasePrice: number | null;
  status: string;
}

export interface KolamLocationInventoryResult<TItem> {
  items: TItem[];
  total: number;
}

export interface KolamLocationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamLocationListQuery {
  limit?: number;
  name?: string;
  page?: number;
  parent?: string | null;
  tier?: KolamLocationListTierFilter | '';
  type?: KolamLocationListTypeFilter | '';
}

export interface KolamLocationListResult {
  items: KolamLocationListItem[];
  pagination: KolamLocationPagination;
}

export interface KolamLocationSavePayload {
  address?: string | null;
  description?: string | null;
  mapsUrl?: string | null;
  name: string;
  parent?: string | null;
  phoneNumber?: string | null;
  tier: KolamLocationTier;
  type: KolamLocationType;
}

export async function getKolamLocations(): Promise<KolamLocationOption[]> {
  const response = await kolamRequest<unknown>('/location', {
    query: {
      limit: 1000,
      page: 1,
    },
  });

  return normalizeKolamLocationList(response);
}

export async function getKolamLocationParentLookup(): Promise<
  Record<string, KolamLocationOption>
> {
  return createKolamLocationLookup(await getKolamLocations());
}

export function createKolamLocationLookup(
  locations: KolamLocationOption[],
): Record<string, KolamLocationOption> {
  return locations.reduce<Record<string, KolamLocationOption>>(
    (lookup, location) => {
      lookup[location.id] = location;
      return lookup;
    },
    {},
  );
}

export async function getKolamLocationList({
  limit = 20,
  name,
  page = 1,
  parent,
  tier,
  type,
}: KolamLocationListQuery = {}): Promise<KolamLocationListResult> {
  const response = await kolamRequest<unknown>('/location', {
    query: {
      limit,
      page,
      ...(name?.trim() ? {name: name.trim()} : {}),
      ...(typeof parent === 'string' && parent.trim()
        ? {parent: parent.trim()}
        : {}),
      ...(parent === null ? {parent: 'null'} : {}),
      ...(tier ? {tier} : {}),
      ...(type ? {type} : {}),
    },
  });

  return normalizeKolamLocationListResult(response, {limit, page});
}

export async function getKolamLocationDetail(
  locationId: string,
): Promise<KolamLocationDetailItem> {
  const response = await kolamRequest<unknown>(`/location/${locationId}`);
  const location = normalizeKolamLocationDetailItem(response);

  if (!location) {
    throw new Error('Lokasi tidak ditemukan.');
  }

  return location;
}

export async function createKolamLocation(
  payload: KolamLocationSavePayload,
): Promise<KolamLocationDetailItem> {
  const response = await kolamRequest<unknown>('/location', {
    body: payload,
    method: 'POST',
  });
  const location = normalizeKolamLocationDetailItem(response);

  if (!location) {
    throw new Error('Lokasi gagal dibuat.');
  }

  return location;
}

export async function updateKolamLocation(
  locationId: string,
  payload: KolamLocationSavePayload,
): Promise<KolamLocationDetailItem> {
  const response = await kolamRequest<unknown>(`/location/${locationId}`, {
    body: payload,
    method: 'PUT',
  });
  const location = normalizeKolamLocationDetailItem(response);

  if (!location) {
    throw new Error('Lokasi gagal diperbarui.');
  }

  return location;
}

export async function deleteKolamLocation(locationId: string): Promise<void> {
  await kolamRequest<unknown>(`/location/${locationId}`, {
    method: 'DELETE',
  });
}

export async function getKolamLocationProducts(
  locationId: string,
): Promise<KolamLocationInventoryResult<KolamLocationProductRow>> {
  const response = await kolamRequest<unknown>(`/location/${locationId}/products`);
  return normalizeKolamLocationInventoryResult(
    response,
    normalizeKolamLocationProductRow,
  );
}

export async function getKolamLocationEnclosures(
  locationId: string,
): Promise<KolamLocationInventoryResult<KolamLocationEnclosureRow>> {
  const response = await kolamRequest<unknown>(
    `/location/${locationId}/enclosures`,
  );
  return normalizeKolamLocationInventoryResult(
    response,
    normalizeKolamLocationEnclosureRow,
  );
}

export async function getKolamLocationAssets(
  locationId: string,
): Promise<KolamLocationInventoryResult<KolamLocationAssetRow>> {
  const response = await kolamRequest<unknown>(`/location/${locationId}/assets`);
  return normalizeKolamLocationInventoryResult(
    response,
    normalizeKolamLocationAssetRow,
  );
}

function normalizeKolamLocationListResult(
  payload: unknown,
  fallback: Required<Pick<KolamLocationListQuery, 'limit' | 'page'>>,
): KolamLocationListResult {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  return {
    items: rows
      .map(normalizeKolamLocationListItem)
      .filter((item): item is KolamLocationListItem => Boolean(item)),
    pagination: normalizeKolamLocationPagination(
      record.pagination,
      rows.length,
      fallback,
    ),
  };
}

function normalizeKolamLocationListItem(
  value: unknown,
): KolamLocationListItem | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    type: getString(record, 'type'),
    tier: getString(record, 'tier'),
    parent: normalizeKolamLocationParent(record.parent),
    description: getString(record, 'description'),
    address: getString(record, 'address'),
    capacitySlots: getNumber(record, 'capacitySlots') ?? null,
    children: normalizeKolamLocationChildList(record.children),
    mapsUrl: getString(record, 'mapsUrl'),
    phoneNumber: getString(record, 'phoneNumber') || getString(record, 'phone'),
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
  };
}

function normalizeKolamLocationDetailItem(
  payload: unknown,
): KolamLocationDetailItem | null {
  const record = asRecord(payload);
  const raw = asRecord(record.data);
  const base = normalizeKolamLocationListItem(
    Object.keys(raw).length ? raw : payload,
  );

  if (!base) {
    return null;
  }

  const source = Object.keys(raw).length ? raw : record;

  return {
    ...base,
    children: normalizeKolamLocationChildList(source.children),
    secondary: normalizeKolamLocationChildList(source.secondary),
    tertiary: normalizeKolamLocationChildList(source.tertiary),
  };
}

function normalizeKolamLocationChildList(value: unknown) {
  return Array.isArray(value)
    ? value
        .map(normalizeKolamLocationListItem)
        .filter((item): item is KolamLocationListItem => Boolean(item))
    : [];
}

function normalizeKolamLocationInventoryResult<TItem>(
  payload: unknown,
  normalizeItem: (value: unknown) => TItem | null,
): KolamLocationInventoryResult<TItem> {
  const record = asRecord(payload);
  const meta = asRecord(record.meta);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];
  const items = rows
    .map(normalizeItem)
    .filter((item): item is TItem => Boolean(item));

  return {
    items,
    total: getNumber(meta, 'total') ?? items.length,
  };
}

function normalizeKolamLocationProductRow(
  value: unknown,
): KolamLocationProductRow | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
    sellable: getBoolean(record, 'sellable'),
    sku: getString(record, 'sku'),
    status: getString(record, 'status'),
    stock: getNumber(record, 'stock') ?? 0,
    thumbnailImage: getString(record, 'thumbnailImage'),
    type: getString(record, 'type'),
  };
}

function normalizeKolamLocationEnclosureRow(
  value: unknown,
): KolamLocationEnclosureRow | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name =
    getString(record, 'enclosure_name') ||
    getString(record, 'enclosureName') ||
    getString(record, 'name');

  if (!id || !name) {
    return null;
  }

  return {
    assignedToName: getAssignedToName(record.assignedTo),
    code:
      getString(record, 'enclosure_code') ||
      getString(record, 'enclosureCode') ||
      getString(record, 'code'),
    coverPhotoUrl: getString(record, 'coverPhotoUrl'),
    id,
    name,
    status: getString(record, 'status'),
    type:
      getString(record, 'enclosure_type') ||
      getString(record, 'enclosureType') ||
      getString(record, 'type'),
  };
}

function normalizeKolamLocationAssetRow(
  value: unknown,
): KolamLocationAssetRow | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');

  if (!id || !name) {
    return null;
  }

  return {
    code: getString(record, 'code'),
    id,
    name,
    purchasePrice: getNumber(record, 'purchasePrice') ?? null,
    status: getString(record, 'status'),
  };
}

function normalizeKolamLocationParent(
  value: unknown,
): KolamLocationParentRef | null {
  if (typeof value === 'string') {
    return value.trim()
      ? {id: value.trim(), name: '', type: '', tier: ''}
      : null;
  }

  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  return {
    id,
    name: getString(record, 'name'),
    type: getString(record, 'type'),
    tier: getString(record, 'tier'),
  };
}

function normalizeKolamLocationPagination(
  value: unknown,
  itemCount: number,
  fallback: Required<Pick<KolamLocationListQuery, 'limit' | 'page'>>,
): KolamLocationPagination {
  const record = asRecord(value);
  const page = Math.max(1, getNumber(record, 'page') ?? fallback.page);
  const limit = Math.max(1, getNumber(record, 'limit') ?? fallback.limit);
  const total = Math.max(0, getNumber(record, 'total') ?? itemCount);
  const totalPages =
    getNumber(record, 'totalPages') ?? Math.max(1, Math.ceil(total / limit));

  return {limit, page, total, totalPages: Math.max(1, totalPages)};
}

function normalizeKolamLocationList(payload: unknown): KolamLocationOption[] {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  return rows
    .map(normalizeKolamLocationOption)
    .filter((location): location is KolamLocationOption => Boolean(location));
}

function normalizeKolamLocationOption(value: unknown): KolamLocationOption | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');

  if (!id || !name) {
    return null;
  }

  const type = getString(record, 'type');
  const tier = getString(record, 'tier');
  const parent = asRecord(record.parent);
  const parentName = getString(parent, 'name');
  const label = [name, parentName, type].filter(Boolean).join(' - ');

  return {
    id,
    name,
    label: label || name,
    type,
    tier,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === 'boolean' ? value : null;
}

function getAssignedToName(value: unknown) {
  const record = asRecord(value);

  return (
    getString(record, 'name') ||
    getString(record, 'fullName') ||
    [getString(record, 'firstName'), getString(record, 'lastName')]
      .filter(Boolean)
      .join(' ')
  );
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
