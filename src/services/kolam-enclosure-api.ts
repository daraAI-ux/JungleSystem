import { appConfig } from '../config/app';
import {
  createKolamEnclosureListQuery,
  normalizeKolamEnclosure,
  normalizeKolamEnclosureAllocationOverview,
  normalizeKolamEnclosureDashboardStats,
  normalizeKolamEnclosureDetail,
  normalizeKolamEnclosureList,
  normalizeKolamEnclosurePendingAllocations,
  type KolamEnclosure,
  type KolamEnclosureAllocationOverview,
  type KolamEnclosureDashboardStats,
  type KolamEnclosureListFilters,
  type KolamEnclosureListResult,
  type KolamEnclosurePendingAllocationResult,
  type KolamEnclosureStaffRef,
  type KolamEnclosureType,
  type KolamEnclosureUnitRef,
} from '../domain/kolam-enclosure';
import { apiRequest } from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;
type DataResponse<T> = { data?: T };

const BASE = '/enclosures';

export interface KolamEnclosureSizeInput {
  high: { value: number; unit: string | KolamEnclosureUnitRef };
  width: { value: number; unit: string | KolamEnclosureUnitRef };
  length: { value: number; unit: string | KolamEnclosureUnitRef };
}

export interface KolamEnclosureCreateBody {
  enclosure_code: string;
  enclosure_name?: string;
  enclosure_type: KolamEnclosureType;
  type_aquarium?: 'freshwater' | 'marine' | string;
  enclosure_size: KolamEnclosureSizeInput;
  note?: string;
  locationId: string;
  assignedTo: string;
  livestockPurpose?: 'saleable' | 'production';
}

export async function getKolamEnclosures(
  filters: KolamEnclosureListFilters,
): Promise<KolamEnclosureListResult> {
  const response = await kolamRequest<unknown>(BASE, {
    query: createKolamEnclosureListQuery(filters),
  });

  return normalizeKolamEnclosureList(response, {
    limit: filters.limit,
    page: filters.page,
  });
}

export async function getKolamEnclosureDashboardStats(): Promise<KolamEnclosureDashboardStats> {
  const response = await kolamRequest<unknown>(`${BASE}/dashboard-stats`);
  return normalizeKolamEnclosureDashboardStats(response);
}

export async function getKolamEnclosureDetail(
  enclosureId: string,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}`,
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function getKolamPendingLivestockAllocations(
  params: { saleId?: string; status?: string } = {},
): Promise<KolamEnclosurePendingAllocationResult> {
  const response = await kolamRequest<unknown>(
    `${BASE}/pending-livestock-allocations`,
    {
      query: {
        saleId: params.saleId?.trim() || undefined,
        status: params.status?.trim() || undefined,
      },
    },
  );

  return normalizeKolamEnclosurePendingAllocations(response);
}

export async function getKolamSpeciesAllocationOverview(): Promise<KolamEnclosureAllocationOverview> {
  const response = await kolamRequest<unknown>(
    `${BASE}/species-allocation-overview`,
  );
  return normalizeKolamEnclosureAllocationOverview(response);
}

export async function getKolamEnclosureStaffAssignees(
  params: { search?: string; limit?: number } = {},
): Promise<KolamEnclosureStaffRef[]> {
  const response = await kolamRequest<DataResponse<unknown[]>>(
    `${BASE}/staff-assignees`,
    {
      query: {
        search: params.search?.trim() || undefined,
        limit: params.limit ?? 200,
      },
    },
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map(normalizeStaffAssignee).filter(item => item.id);
}

export async function createKolamEnclosure(
  body: KolamEnclosureCreateBody,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(BASE, {
    method: 'POST',
    body: createKolamEnclosurePayload(body),
  });

  return normalizeKolamEnclosure(unwrapData(response));
}

export async function updateKolamEnclosureAssignedTo(
  enclosureId: string,
  assignedTo: string | null,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/assigned-to`,
    {
      method: 'PUT',
      body: { assignedTo },
    },
  );

  return normalizeKolamEnclosure(unwrapData(response));
}

export async function deleteKolamEnclosure(enclosureId: string): Promise<void> {
  await kolamRequest<unknown>(`${BASE}/${encodeURIComponent(enclosureId)}`, {
    method: 'DELETE',
  });
}

export async function resolveKolamEnclosureLivestockAllocation(payload: {
  pendingId: string;
  allocations: { enclosureId: string; qty: number }[];
}): Promise<void> {
  await kolamRequest<unknown>(`${BASE}/resolve-livestock-allocation`, {
    method: 'POST',
    body: payload,
  });
}

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, QueryValue>;
    body?: unknown;
  } = {},
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

function createKolamEnclosurePayload(body: KolamEnclosureCreateBody) {
  const enclosureCode = body.enclosure_code.trim().toUpperCase();

  return {
    enclosure_code: enclosureCode,
    enclosure_name: body.enclosure_name?.trim() || enclosureCode,
    enclosure_type: body.enclosure_type,
    type_aquarium:
      body.enclosure_type === 'Aquarium' ? body.type_aquarium : undefined,
    enclosure_size: body.enclosure_size,
    note: body.note?.trim() || undefined,
    locationId: body.locationId,
    assignedTo: body.assignedTo,
    livestockPurpose: body.livestockPurpose ?? 'saleable',
  };
}

function normalizeStaffAssignee(value: unknown): KolamEnclosureStaffRef {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const firstName =
    getString(record, 'first_name') || getString(record, 'firstName');
  const lastName =
    getString(record, 'last_name') || getString(record, 'lastName');
  const username = getString(record, 'username');
  const email = getString(record, 'email');
  const displayName =
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    username ||
    email ||
    id;
  const hr = asRecord(record.hr);

  return {
    id,
    firstName,
    lastName,
    username,
    email,
    displayName,
    photo:
      getString(record, 'profile_picture') ||
      getString(record, 'photo') ||
      getString(hr, 'photo'),
  };
}

function unwrapData(value: unknown) {
  return value && typeof value === 'object' && 'data' in value
    ? (value as { data: unknown }).data
    : value;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string'
    ? value.trim()
    : value == null
      ? ''
      : String(value).trim();
}
