import { appConfig } from '../config/app';
import {
  normalizeKolamComplaintDetail,
  normalizeKolamComplaintList,
  type KolamComplaint,
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

export async function updateKolamComplaintReturnStatus(
  id: string,
  body: {
    status: KolamComplaintTrackingStatus;
    note?: string;
    verifiedNote?: string;
    trackingNumber?: string;
    courierName?: string;
    receivedBy?: string;
  },
): Promise<KolamComplaint> {
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
  if (body.receivedBy?.trim()) {
    formData.append('receivedBy', body.receivedBy.trim());
  }

  const payload = await kolamRequest<unknown>(
    `/complaints/${encodeURIComponent(id)}/return`,
    { method: 'PUT', body: formData },
  );
  return normalizeKolamComplaintDetail(payload);
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
