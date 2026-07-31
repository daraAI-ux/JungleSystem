import { appConfig } from '../config/app';
import {
  normalizeKolamComplaintDetail,
  normalizeKolamComplaintList,
  type KolamComplaint,
  type KolamComplaintCreateInput,
  type KolamComplaintDecision,
  type KolamComplaintKpiSeverity,
  type KolamComplaintListQuery,
  type KolamComplaintListResult,
  type KolamComplaintStatus,
  type KolamComplaintTrackingStatus,
} from '../domain/kolam-complaint';
import { apiRequest } from '../lib/api-client';

interface DataResponse<T> {
  data: T;
}

export async function getKolamComplaints(
  query: KolamComplaintListQuery = {},
): Promise<KolamComplaintListResult> {
  const payload = await kolamRequest<unknown>('/complaints', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.decision ? { decision: query.decision } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.customProject ? { customProject: '1' } : {}),
    },
  });
  return normalizeKolamComplaintList(payload, query);
}

export async function getKolamComplaint(id: string): Promise<KolamComplaint> {
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}`,
  );
  return normalizeKolamComplaintDetail(payload);
}

export async function updateKolamComplaintStatus(
  id: string,
  body: { status: KolamComplaintStatus; note: string },
): Promise<KolamComplaint> {
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}/status`,
    { method: 'PUT', body },
  );
  return normalizeKolamComplaintDetail(payload);
}

export async function updateKolamComplaintDecision(
  id: string,
  body: {
    decision: NonNullable<KolamComplaintDecision>;
    note: string;
    refundAmount?: number;
  },
): Promise<KolamComplaint> {
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}/decision`,
    { method: 'PUT', body },
  );
  return normalizeKolamComplaintDetail(payload);
}

export async function assignKolamComplaintStaff(
  id: string,
  body: { staffId: string; note?: string },
): Promise<KolamComplaint> {
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}/assign`,
    { method: 'PUT', body },
  );
  return normalizeKolamComplaintDetail(payload);
}

export async function closeKolamComplaint(
  id: string,
  body: {
    note: string;
    kpiSeverity?: KolamComplaintKpiSeverity | null;
    kpiAttributedTo?: string | null;
  },
): Promise<KolamComplaint> {
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}/close`,
    { method: 'PUT', body },
  );
  return normalizeKolamComplaintDetail(payload);
}

export type KolamComplaintTrackingUpdateBody = {
  status: KolamComplaintTrackingStatus;
  note?: string;
  verifiedNote?: string;
  trackingNumber?: string;
  courierName?: string;
  receivedBy?: string;
  receivedByType?: 'customer' | 'other';
  photoUris?: string[];
};

export async function updateKolamComplaintReturnStatus(
  id: string,
  body: KolamComplaintTrackingUpdateBody,
): Promise<KolamComplaint> {
  const formData = buildComplaintTrackingFormData(body);
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}/return`,
    { method: 'PUT', body: formData },
  );
  return normalizeKolamComplaintDetail(payload);
}

/** PUT /complaints/:id/replacement — after return verified. */
export async function updateKolamComplaintReplacementStatus(
  id: string,
  body: KolamComplaintTrackingUpdateBody,
): Promise<KolamComplaint> {
  const formData = buildComplaintTrackingFormData(body, {
    includeReceivedByType: true,
  });
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}/replacement`,
    { method: 'PUT', body: formData },
  );
  return normalizeKolamComplaintDetail(payload);
}

/** PUT /complaints/:id/replacement-return */
export async function updateKolamComplaintReplacementReturnStatus(
  id: string,
  body: KolamComplaintTrackingUpdateBody,
): Promise<KolamComplaint> {
  const formData = buildComplaintTrackingFormData(body);
  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}/replacement-return`,
    { method: 'PUT', body: formData },
  );
  return normalizeKolamComplaintDetail(payload);
}

function buildComplaintTrackingFormData(
  body: KolamComplaintTrackingUpdateBody,
  options?: { includeReceivedByType?: boolean },
): FormData {
  const formData = new FormData();
  formData.append('status', body.status);
  if (body.status === 'verified') {
    if (body.verifiedNote?.trim()) {
      formData.append('verifiedNote', body.verifiedNote.trim());
    }
    if (body.note?.trim()) {
      formData.append('note', body.note.trim());
    }
  } else {
    formData.append('note', body.note?.trim() || '');
  }
  if (body.trackingNumber?.trim()) {
    formData.append('trackingNumber', body.trackingNumber.trim());
  }
  if (body.courierName?.trim()) {
    formData.append('courierName', body.courierName.trim());
  }
  if (options?.includeReceivedByType && body.receivedByType) {
    formData.append('receivedByType', body.receivedByType);
  }
  if (body.receivedBy?.trim()) {
    formData.append('receivedBy', body.receivedBy.trim());
  }
  for (const [index, uri] of (body.photoUris ?? []).entries()) {
    if (!uri.trim()) {
      continue;
    }
    formData.append(
      'photos',
      createReactNativeFilePart(
        uri.trim(),
        `complaint-tracking-photo-${index + 1}.jpg`,
      ) as unknown as Blob,
    );
  }
  return formData;
}

export async function createKolamComplaint(
  input: KolamComplaintCreateInput,
): Promise<KolamComplaint> {
  const formData = new FormData();
  formData.append('sale', input.saleId.trim());
  formData.append('description', input.description.trim());
  formData.append(
    'items',
    JSON.stringify(
      input.items.map(item => ({
        saleItemIndex: item.saleItemIndex,
        quantity: item.quantity,
        ...(item.reason?.trim() ? { reason: item.reason.trim() } : {}),
      })),
    ),
  );
  formData.append('category', input.category);
  formData.append('priority', input.priority);
  if (input.createdByCustomerId?.trim()) {
    formData.append('createdBy', input.createdByCustomerId.trim());
  }
  if (input.pendingServiceId?.trim()) {
    formData.append('pendingService', input.pendingServiceId.trim());
  }
  if (input.subscriptionId?.trim()) {
    formData.append('subscription', input.subscriptionId.trim());
  }
  if (input.serviceContext) {
    formData.append('serviceContext', JSON.stringify(input.serviceContext));
  }
  for (const [index, uri] of (input.photoUris ?? []).entries()) {
    if (!uri.trim()) {
      continue;
    }
    formData.append(
      'photos',
      createReactNativeFilePart(
        uri.trim(),
        `complaint-photo-${index + 1}.jpg`,
      ) as unknown as Blob,
    );
  }

  const payload = await kolamRequest<unknown>('/complaints', {
    method: 'POST',
    body: formData,
  });
  return normalizeKolamComplaintDetail(payload);
}

function createReactNativeFilePart(localUri: string, fallbackName: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;
  const extension = name.split('.').pop()?.toLowerCase();
  const type =
    extension === 'png'
      ? 'image/png'
      : extension === 'webp'
        ? 'image/webp'
        : extension === 'gif'
          ? 'image/gif'
          : 'image/jpeg';

  return {
    uri: normalizedUri,
    name,
    type,
  };
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
