import { appConfig } from '../config/app';
import {
  createKolamEnclosureListQuery,
  normalizeKolamEnclosure,
  normalizeKolamEnclosureAllocationOverview,
  normalizeKolamEnclosureDashboardStats,
  normalizeKolamEnclosureDetail,
  normalizeKolamEnclosureList,
  normalizeKolamEnclosureComments,
  normalizeKolamEnclosurePendingAllocations,
  normalizeKolamEnclosureRecurringEnrollments,
  normalizeKolamEnclosureSpawnTaskResult,
  normalizeKolamEnclosureStatistics,
  normalizeKolamEnclosureTaskTypes,
  normalizeKolamEnclosureTasks,
  type KolamEnclosure,
  type KolamEnclosureAllocationOverview,
  type KolamEnclosureComment,
  type KolamEnclosureDashboardStats,
  type KolamEnclosureListFilters,
  type KolamEnclosureListResult,
  type KolamEnclosurePendingAllocationResult,
  type KolamEnclosureRecurringEnrollment,
  type KolamEnclosureSpawnTaskResult,
  type KolamEnclosureStaffRef,
  type KolamEnclosureStatistics,
  type KolamEnclosureTaskItem,
  type KolamEnclosureTaskType,
  type KolamEnclosureType,
  type KolamEnclosureClientScope,
  type KolamEnclosureUnitRef,
} from '../domain/kolam-enclosure';
import { apiRequest } from '../lib/api-client';

type QueryValue = string | number | boolean | undefined | null;
type DataResponse<T> = { data?: T };

const BASE = '/enclosures';
const TASK_MANAGER_BASE = '/task-manager';
const ENCLOSURE_TASK_TYPES_BASE = '/enclosure-task-types';

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
  brandId?: string | null;
  livestockPurpose?: 'saleable' | 'production';
}

export interface KolamEnclosureParameterInput {
  parameter_name: string;
  current_value?: number | string | null;
  unit?: string | null;
  alert_setting?: {
    constant?: number | string | null;
    range?: {
      min?: number | string | null;
      max?: number | string | null;
    };
  };
}

export interface KolamEnclosureUpdateBody {
  enclosure_code?: string;
  enclosure_name?: string;
  enclosure_type?: KolamEnclosureType | string;
  type_aquarium?: string | null;
  note?: string | null;
  status?: string;
  locationId?: string | null;
  brandId?: string | null;
  acquired_date?: string | null;
  clientScope?: KolamEnclosureClientScope;
  livestockPurpose?: 'saleable' | 'production';
  enclosure_size?: KolamEnclosureSizeInput;
}

export interface KolamEnclosureSpeciesAttachInput {
  enclosureId: string;
  speciesId: string;
  quantity?: number;
  variantId?: string | null;
  reason?: string;
}

export interface KolamEnclosurePopulationEventInput {
  enclosureId: string;
  speciesId: string;
  delta: number;
  variantId?: string | null;
  eventType?: string | null;
  reason?: string;
  saleId?: string;
  invoiceCode?: string;
  photoUris?: string[];
}

export interface KolamEnclosureSpeciesTransferInput {
  enclosureId: string;
  targetEnclosureId: string;
  speciesId: string;
  quantity?: number;
  variantId?: string | null;
  reason?: string;
}

export interface KolamEnclosureCrossPoolTransferInput
  extends KolamEnclosureSpeciesTransferInput {
  direction: 'release_to_sale' | 'take_to_production';
}

export interface KolamEnclosureVariantSwitchInput {
  enclosureId: string;
  speciesId: string;
  fromVariantId: string;
  toVariantId: string;
  quantity?: number;
  reason?: string;
  photoUris?: string[];
}

export interface KolamEnclosureSaleListingInput {
  action: 'list' | 'clear' | 'reserve' | 'sold';
  salePrice?: number;
  saleId?: string | null;
}

export interface KolamEnclosureProductionEggInput {
  enclosureId: string;
  speciesId: string;
  quantity: number;
  reason?: string;
}

export interface KolamEnclosureProductionEggAdvanceInput
  extends KolamEnclosureProductionEggInput {
  toStageKey?: string;
}

export interface KolamEnclosureProductionPhaseChangeInput {
  enclosureId?: string | null;
  speciesId: string;
  fromStageKey: string;
  toStageKey: string;
  quantity: number;
  reason?: string;
}

export interface KolamEnclosureProductionPhaseToSaleInput {
  enclosureId: string;
  speciesId: string;
  stageKey: string;
  quantity: number;
  reason?: string;
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

export async function getKolamEnclosureStatistics(
  enclosureId: string,
): Promise<KolamEnclosureStatistics> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/statistics`,
  );
  return normalizeKolamEnclosureStatistics(response);
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

export async function upsertKolamEnclosureParameter(
  enclosureId: string,
  body: KolamEnclosureParameterInput,
): Promise<void> {
  await kolamRequest<unknown>(`${BASE}/${encodeURIComponent(enclosureId)}/parameters`, {
    method: 'POST',
    body: {
      parameter_name: body.parameter_name,
      current_value: body.current_value,
      unit: body.unit ?? null,
      alert_setting: body.alert_setting,
    },
  });
}

export async function updateKolamEnclosure(
  enclosureId: string,
  body: KolamEnclosureUpdateBody,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}`,
    {method: 'PUT', body: createKolamEnclosureUpdatePayload(body)},
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function uploadKolamEnclosureCoverPhoto(
  enclosureId: string,
  localUri: string,
): Promise<KolamEnclosure> {
  const body = new FormData();
  body.append(
    'photo',
    createReactNativeFilePart(localUri, 'enclosure-cover.jpg') as unknown as Blob,
  );
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/cover-photo`,
    {method: 'POST', body},
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function deleteKolamEnclosureCoverPhoto(
  enclosureId: string,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/cover-photo`,
    {method: 'DELETE'},
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function uploadKolamEnclosurePhotos(
  enclosureId: string,
  localUris: string[],
): Promise<KolamEnclosure> {
  const body = new FormData();
  for (const uri of localUris) {
    if (uri.trim()) {
      body.append(
        'photos',
        createReactNativeFilePart(uri.trim(), 'enclosure-photo.jpg') as unknown as Blob,
      );
    }
  }
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/photos`,
    {method: 'POST', body},
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function deleteKolamEnclosurePhoto(
  enclosureId: string,
  index: number,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/photos/${encodeURIComponent(String(index))}`,
    {method: 'DELETE'},
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function attachKolamEnclosureSpecies(
  input: KolamEnclosureSpeciesAttachInput,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(input.enclosureId)}/species`,
    {
      method: 'POST',
      body: {
        speciesId: input.speciesId,
        quantity: input.quantity ?? 1,
        variantId: input.variantId ?? null,
        reason: input.reason?.trim() || undefined,
      },
    },
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function recordKolamEnclosurePopulationEvent(
  input: KolamEnclosurePopulationEventInput,
): Promise<KolamEnclosure> {
  const body = new FormData();
  body.append('speciesId', input.speciesId);
  body.append('delta', String(input.delta));
  appendOptionalFormValue(body, 'variantId', input.variantId);
  appendOptionalFormValue(body, 'eventType', input.eventType);
  appendOptionalFormValue(body, 'reason', input.reason);
  appendOptionalFormValue(body, 'saleId', input.saleId);
  appendOptionalFormValue(body, 'invoiceCode', input.invoiceCode);
  appendPhotoParts(body, input.photoUris);

  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(input.enclosureId)}/species-population-event`,
    {method: 'POST', body},
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function transferKolamEnclosureSpecies(
  input: KolamEnclosureSpeciesTransferInput,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(input.enclosureId)}/species-transfer`,
    {
      method: 'POST',
      body: createSpeciesTransferPayload(input),
    },
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function crossPoolTransferKolamEnclosureSpecies(
  input: KolamEnclosureCrossPoolTransferInput,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(input.enclosureId)}/species-cross-pool-transfer`,
    {
      method: 'POST',
      body: {...createSpeciesTransferPayload(input), direction: input.direction},
    },
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function switchKolamEnclosureSpeciesVariant(
  input: KolamEnclosureVariantSwitchInput,
): Promise<KolamEnclosure> {
  const body = new FormData();
  body.append('speciesId', input.speciesId);
  body.append('fromVariantId', input.fromVariantId);
  body.append('toVariantId', input.toVariantId);
  body.append('quantity', String(input.quantity ?? 1));
  appendOptionalFormValue(body, 'reason', input.reason);
  appendPhotoParts(body, input.photoUris);

  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(input.enclosureId)}/species-variant-switch`,
    {method: 'POST', body},
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function updateKolamEnclosureSaleListing(
  enclosureId: string,
  body: KolamEnclosureSaleListingInput,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/sale-listing`,
    {method: 'PUT', body},
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function getKolamEnclosureComments(
  enclosureId: string,
): Promise<KolamEnclosureComment[]> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/comments`,
  );
  return normalizeKolamEnclosureComments(response);
}

export async function getKolamEnclosureTasks(
  enclosureId: string,
): Promise<KolamEnclosureTaskItem[]> {
  const response = await kolamRequest<unknown>(
    `${TASK_MANAGER_BASE}/by-enclosure/${encodeURIComponent(enclosureId)}`,
  );
  return normalizeKolamEnclosureTasks(response);
}

export async function spawnKolamEnclosureTask(input: {
  enclosureId: string;
  title?: string;
  description?: string;
  taskTypeId?: string;
}): Promise<KolamEnclosureSpawnTaskResult> {
  const response = await kolamRequest<unknown>(
    `${TASK_MANAGER_BASE}/spawn/enclosure/${encodeURIComponent(input.enclosureId)}`,
    {
      method: 'POST',
      body: {
        title: input.title?.trim() || undefined,
        description: input.description?.trim() || undefined,
        taskTypeId: input.taskTypeId?.trim() || undefined,
      },
    },
  );
  return normalizeKolamEnclosureSpawnTaskResult(response);
}

export async function getKolamEnclosureTaskTypes(options?: {
  includeInactive?: boolean;
}): Promise<KolamEnclosureTaskType[]> {
  const response = await kolamRequest<unknown>(ENCLOSURE_TASK_TYPES_BASE, {
    query: options?.includeInactive ? {includeInactive: 'true'} : undefined,
  });
  return normalizeKolamEnclosureTaskTypes(response);
}

export async function getKolamEnclosureRecurringEnrollments(
  enclosureId: string,
): Promise<KolamEnclosureRecurringEnrollment[]> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/recurring-enrollments`,
  );
  return normalizeKolamEnclosureRecurringEnrollments(response);
}

export async function setKolamEnclosureRecurringEnrollment(
  enclosureId: string,
  body: {taskTypeId: string; active: boolean},
): Promise<void> {
  await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(enclosureId)}/recurring-enrollments`,
    {
      method: 'PUT',
      body: {
        taskTypeId: body.taskTypeId,
        active: body.active,
      },
    },
  );
}

export async function createKolamEnclosureComment(
  enclosureId: string,
  comment: string,
): Promise<void> {
  await kolamRequest<unknown>(`${BASE}/${encodeURIComponent(enclosureId)}/comments`, {
    method: 'POST',
    body: {comment},
  });
}

export async function replyKolamEnclosureComment(
  commentId: string,
  comment: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `${BASE}/comments/${encodeURIComponent(commentId)}/reply`,
    {method: 'POST', body: {comment}},
  );
}

export async function editKolamEnclosureComment(
  commentId: string,
  comment: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `${BASE}/comments/${encodeURIComponent(commentId)}`,
    {method: 'PATCH', body: {comment}},
  );
}

export async function deleteKolamEnclosureComment(commentId: string): Promise<void> {
  await kolamRequest<unknown>(
    `${BASE}/comments/${encodeURIComponent(commentId)}`,
    {method: 'DELETE'},
  );
}

export async function likeKolamEnclosureComment(commentId: string): Promise<void> {
  await kolamRequest<unknown>(
    `${BASE}/comments/${encodeURIComponent(commentId)}/like`,
    {method: 'PUT'},
  );
}

export async function addKolamEnclosureProductionEggs(
  input: KolamEnclosureProductionEggInput,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(input.enclosureId)}/production-eggs`,
    {
      method: 'POST',
      body: {
        speciesId: input.speciesId,
        quantity: input.quantity,
        reason: input.reason?.trim() || undefined,
      },
    },
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function advanceKolamEnclosureProductionEggs(
  input: KolamEnclosureProductionEggAdvanceInput,
): Promise<KolamEnclosure> {
  const response = await kolamRequest<unknown>(
    `${BASE}/${encodeURIComponent(input.enclosureId)}/production-eggs/advance`,
    {
      method: 'POST',
      body: {
        speciesId: input.speciesId,
        quantity: input.quantity,
        toStageKey: input.toStageKey?.trim() || undefined,
        reason: input.reason?.trim() || undefined,
      },
    },
  );
  return normalizeKolamEnclosureDetail(response);
}

export async function changeKolamEnclosureProductionPhase(
  input: KolamEnclosureProductionPhaseChangeInput,
): Promise<void> {
  await kolamRequest<unknown>(`${BASE}/production-phase-change`, {
    method: 'POST',
    body: input,
  });
}

export async function moveKolamEnclosureProductionPhaseToSale(
  input: KolamEnclosureProductionPhaseToSaleInput,
): Promise<void> {
  await kolamRequest<unknown>(`${BASE}/production-phase-to-sale`, {
    method: 'POST',
    body: input,
  });
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

function createSpeciesTransferPayload(input: KolamEnclosureSpeciesTransferInput) {
  return {
    targetEnclosureId: input.targetEnclosureId,
    speciesId: input.speciesId,
    variantId: input.variantId ?? null,
    quantity: input.quantity ?? 1,
    reason: input.reason?.trim() || undefined,
  };
}

function appendOptionalFormValue(
  body: FormData,
  key: string,
  value: string | number | null | undefined,
) {
  if (value == null) {
    return;
  }
  const text = String(value).trim();
  if (text) {
    body.append(key, text);
  }
}

function appendPhotoParts(body: FormData, photoUris?: string[]) {
  for (const uri of photoUris ?? []) {
    if (uri.trim()) {
      body.append(
        'photos',
        createReactNativeFilePart(uri.trim(), 'enclosure-event-photo.jpg') as unknown as Blob,
      );
    }
  }
}

function createReactNativeFilePart(localUri: string, fallbackName: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;
  return {
    uri: normalizedUri,
    name,
    type: inferFileMimeType(name),
  };
}

function inferFileMimeType(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'jpg':
    case 'jpeg':
    default:
      return 'image/jpeg';
  }
}

function createKolamEnclosurePayload(body: KolamEnclosureCreateBody) {
  const enclosureCode = body.enclosure_code.trim().toUpperCase();

  return {
    enclosure_code: enclosureCode,
    enclosure_name: body.enclosure_name?.trim() || enclosureCode,
    enclosure_type: body.enclosure_type,
    type_aquarium:
      body.enclosure_type === 'Aquarium' ? body.type_aquarium : undefined,
    enclosure_size: normalizeEnclosureSizePayload(body.enclosure_size),
    note: body.note?.trim() || undefined,
    locationId: body.locationId,
    assignedTo: body.assignedTo,
    brandId: body.brandId,
    livestockPurpose: body.livestockPurpose ?? 'saleable',
  };
}

function createKolamEnclosureUpdatePayload(body: KolamEnclosureUpdateBody) {
  const payload: Record<string, unknown> = {};

  if (body.enclosure_code != null) {
    payload.enclosure_code = body.enclosure_code.trim().toUpperCase();
  }
  if (body.enclosure_name != null) {
    payload.enclosure_name = body.enclosure_name.trim();
  }
  if (body.enclosure_type != null) {
    payload.enclosure_type = body.enclosure_type;
  }
  if (body.type_aquarium !== undefined) {
    payload.type_aquarium =
      body.type_aquarium == null || !String(body.type_aquarium).trim()
        ? null
        : String(body.type_aquarium).trim();
  }
  if (body.note !== undefined) {
    payload.note =
      body.note == null || !String(body.note).trim()
        ? null
        : String(body.note).trim();
  }
  if (body.status != null) {
    payload.status = body.status;
  }
  if (body.locationId !== undefined) {
    payload.locationId =
      body.locationId && String(body.locationId).trim()
        ? String(body.locationId).trim()
        : null;
  }
  if (body.brandId !== undefined) {
    payload.brandId =
      body.brandId && String(body.brandId).trim()
        ? String(body.brandId).trim()
        : null;
  }
  if (body.acquired_date !== undefined) {
    payload.acquired_date =
      body.acquired_date && String(body.acquired_date).trim()
        ? String(body.acquired_date).trim()
        : null;
  }
  if (body.clientScope != null) {
    payload.clientScope = body.clientScope;
  }
  if (body.livestockPurpose != null) {
    payload.livestockPurpose = body.livestockPurpose;
  }
  if (body.enclosure_size != null) {
    payload.enclosure_size = normalizeEnclosureSizePayload(body.enclosure_size);
  }

  return payload;
}

function normalizeEnclosureSizePayload(size: KolamEnclosureSizeInput) {
  return {
    high: {
      value: Number(size.high.value),
      unit: enclosureSizeUnitId(size.high.unit),
    },
    width: {
      value: Number(size.width.value),
      unit: enclosureSizeUnitId(size.width.unit),
    },
    length: {
      value: Number(size.length.value),
      unit: enclosureSizeUnitId(size.length.unit),
    },
  };
}

function enclosureSizeUnitId(unit: string | KolamEnclosureUnitRef) {
  if (typeof unit === 'string') {
    return unit;
  }
  return unit.id || unit.initial || unit.name || '';
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
