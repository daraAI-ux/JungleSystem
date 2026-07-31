import { appConfig } from '../config/app';
import {
  normalizeKolamLayananOpsDashboard,
  normalizeKolamLayananPendingList,
  normalizeKolamLayananScheduleRequirements,
  normalizeKolamLayananService,
  normalizeKolamLayananServiceList,
  normalizeKolamLayananSubscriptionDetail,
  normalizeKolamLayananSubscriptionList,
  normalizeKolamLayananSubscriptionPendingVerifications,
  normalizeKolamLayananSubscriptionVisitPreviews,
  normalizeKolamLayananTermsContext,
  normalizeKolamLayananTaskDetail,
  normalizeKolamLayananVoucherDetail,
  type KolamLayananOpsDashboard,
  type KolamLayananPendingListQuery,
  type KolamLayananPendingListResult,
  type KolamLayananRejectionDecision,
  type KolamLayananScheduleRequirements,
  type KolamLayananService,
  type KolamLayananServiceListQuery,
  type KolamLayananServiceListResult,
  type KolamLayananServiceSavePayload,
  type KolamLayananSubscriptionDetail,
  type KolamLayananSubscriptionListQuery,
  type KolamLayananSubscriptionListResult,
  type KolamLayananSubscriptionPendingVerification,
  type KolamLayananSubscriptionVisitPreview,
  type KolamLayananTaskDetail,
  type KolamLayananTermsContext,
  type KolamLayananVisitSlot,
  type KolamLayananVoucherDetail,
  type KolamLayananVoucherMaterialChargeMode,
} from '../domain/kolam-layanan';
import { apiRequest } from '../lib/api-client';
import { downloadKolamSaleInvoice } from './kolam-sales-api';

interface DataResponse<T> {
  data: T;
}

export async function getKolamLayananServices(
  query: KolamLayananServiceListQuery = {},
): Promise<KolamLayananServiceListResult> {
  const payload = await kolamRequest<unknown>('/service', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.sortBy ? { sortBy: query.sortBy } : {}),
      ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
      ...(typeof query.sellable === 'boolean'
        ? { sellable: query.sellable }
        : {}),
    },
  });
  return normalizeKolamLayananServiceList(payload, query);
}

export async function getKolamLayananService(
  id: string,
): Promise<KolamLayananService> {
  const payload = await kolamRequest<unknown>(
    `/service/${encodeURIComponent(id)}`,
  );
  return normalizeKolamLayananService(payload);
}

export async function createKolamLayananService(
  body: KolamLayananServiceSavePayload,
): Promise<KolamLayananService> {
  const payload = await kolamRequest<unknown>('/service', {
    method: 'POST',
    body,
  });
  return normalizeKolamLayananService(payload);
}

export async function updateKolamLayananService(
  id: string,
  body: KolamLayananServiceSavePayload,
): Promise<KolamLayananService> {
  const payload = await kolamRequest<unknown>(
    `/service/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      body,
    },
  );
  return normalizeKolamLayananService(payload);
}

export async function getKolamLayananOpsDashboard(): Promise<KolamLayananOpsDashboard> {
  const payload = await kolamRequest<unknown>('/service-ops/dashboard');
  return normalizeKolamLayananOpsDashboard(payload);
}

export async function getKolamLayananPendingServices(
  query: KolamLayananPendingListQuery = {},
): Promise<KolamLayananPendingListResult> {
  const payload = await kolamRequest<unknown>('/pending-services', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.status ? { status: query.status } : {}),
      ...(query.statuses ? { statuses: query.statuses } : {}),
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
    },
  });
  return normalizeKolamLayananPendingList(payload, query);
}

export async function getKolamLayananSubscriptions(
  query: KolamLayananSubscriptionListQuery = {},
): Promise<KolamLayananSubscriptionListResult> {
  const payload = await kolamRequest<unknown>('/subscriptions', {
    query: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      ...(query.status && query.status !== 'all'
        ? { status: query.status }
        : {}),
    },
  });
  return normalizeKolamLayananSubscriptionList(payload, query);
}

export async function getKolamLayananSubscription(
  id: string,
): Promise<KolamLayananSubscriptionDetail> {
  const payload = await kolamRequest<unknown>(
    `/subscriptions/${encodeURIComponent(id)}`,
  );
  return normalizeKolamLayananSubscriptionDetail(payload);
}

export async function getKolamLayananSubscriptionUpcomingVisits(
  id: string,
): Promise<KolamLayananSubscriptionVisitPreview[]> {
  const payload = await kolamRequest<unknown>(
    `/subscriptions/${encodeURIComponent(id)}/upcoming-visits`,
  );
  return normalizeKolamLayananSubscriptionVisitPreviews(payload);
}

export async function getKolamLayananSubscriptionPendingVerifications(
  id: string,
): Promise<KolamLayananSubscriptionPendingVerification[]> {
  const payload = await kolamRequest<unknown>(
    `/subscriptions/${encodeURIComponent(id)}/pending-customer-verifications`,
  );
  return normalizeKolamLayananSubscriptionPendingVerifications(payload);
}

export async function downloadKolamLayananSubscriptionInvoice(
  detail: Pick<
    KolamLayananSubscriptionDetail,
    'saleId' | 'saleInvoiceCode' | 'subscriptionNumber' | 'id'
  >,
): Promise<{ path?: string; name: string }> {
  if (!detail.saleId) {
    throw new Error('Langganan tidak terhubung ke faktur penjualan.');
  }
  return downloadKolamSaleInvoice(
    detail.saleId,
    detail.saleInvoiceCode || detail.subscriptionNumber || detail.id,
  );
}

export async function getKolamLayananVoucher(
  id: string,
): Promise<KolamLayananVoucherDetail> {
  const payload = await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}`,
  );
  return normalizeKolamLayananVoucherDetail(payload);
}

export async function getKolamLayananVoucherScheduleRequirements(
  id: string,
): Promise<KolamLayananScheduleRequirements> {
  const payload = await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/schedule-requirements`,
  );
  return normalizeKolamLayananScheduleRequirements(payload);
}

export async function getKolamLayananVoucherTerms(
  id: string,
): Promise<KolamLayananTermsContext> {
  const payload = await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/service-terms`,
  );
  return normalizeKolamLayananTermsContext(payload);
}

export async function proposeKolamLayananVoucherSchedule(
  id: string,
  slots: KolamLayananVisitSlot[],
  assignedTo?: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/propose-schedule`,
    {
      method: 'POST',
      body: { slots, assignedTo },
    },
  );
}

export async function approveKolamLayananVoucherSchedule(
  id: string,
  assignedTo?: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/approve-schedule`,
    {
      method: 'POST',
      body: assignedTo ? { assignedTo } : {},
    },
  );
}

export async function assignKolamLayananVoucherVisitPic(
  id: string,
  assignedTo: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/assign-visit-pic`,
    {
      method: 'POST',
      body: { assignedTo },
    },
  );
}

export async function rejectKolamLayananVoucherSchedule(
  id: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/reject-schedule`,
    {
      method: 'POST',
      body: {},
    },
  );
}

export async function acceptKolamLayananVoucherTerms(
  id: string,
  termsTemplateIds?: string[],
): Promise<KolamLayananTermsContext> {
  const payload = await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/accept-service-terms`,
    {
      method: 'POST',
      body: { termsTemplateIds },
    },
  );
  return normalizeKolamLayananTermsContext(payload);
}

export async function setKolamLayananVoucherProductComponents(
  id: string,
  productComponents: Array<{
    product?: string | null;
    quantityPerExecution: number;
    inventoryKind?: 'raw' | 'product';
    chargeMode: KolamLayananVoucherMaterialChargeMode;
    unitPrice?: number;
    productName?: string;
  }>,
): Promise<void> {
  await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/product-components`,
    {
      method: 'PUT',
      body: { productComponents },
    },
  );
}

export async function clearKolamLayananVoucherAddonProducts(
  id: string,
): Promise<void> {
  await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/addon-products`,
    {
      method: 'PUT',
      body: { addons: [] },
    },
  );
}

export async function fulfillKolamLayananVoucherAddonStock(
  id: string,
): Promise<{ fulfilled: number; message: string }> {
  const payload = await kolamRequest<unknown>(
    `/pending-services/${encodeURIComponent(id)}/fulfill-addon-stock`,
    {
      method: 'POST',
      body: {},
    },
  );
  const record =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : {};
  const data =
    record.data && typeof record.data === 'object'
      ? (record.data as Record<string, unknown>)
      : {};
  return {
    fulfilled:
      typeof data.fulfilled === 'number'
        ? data.fulfilled
        : Number(data.fulfilled) || 0,
    message:
      typeof record.message === 'string' ? record.message : 'Stok HPP diproses',
  };
}

function taskBasePath(taskType: 'dosing' | 'maintenance') {
  return taskType === 'dosing' ? '/dosing' : '/maintance-schedule';
}

export async function getKolamLayananTaskDetail(
  taskType: 'dosing' | 'maintenance',
  taskId: string,
): Promise<KolamLayananTaskDetail> {
  const payload = await kolamRequest<unknown>(
    `${taskBasePath(taskType)}/${encodeURIComponent(taskId)}`,
  );
  return normalizeKolamLayananTaskDetail(payload, taskType);
}

export async function setKolamLayananExecutionReview(params: {
  taskType: 'dosing' | 'maintenance';
  taskId: string;
  executionId: string;
  reviewStatus: 'accepted' | 'rejected';
  rejectionReason?: string;
  rejectionDecision?: KolamLayananRejectionDecision;
}): Promise<void> {
  await kolamRequest<unknown>(
    `${taskBasePath(params.taskType)}/${encodeURIComponent(params.taskId)}/executions/${encodeURIComponent(params.executionId)}/review`,
    {
      method: 'PUT',
      body: {
        reviewStatus: params.reviewStatus,
        ...(params.rejectionReason
          ? { rejectionReason: params.rejectionReason }
          : {}),
        ...(params.rejectionDecision
          ? { rejectionDecision: params.rejectionDecision }
          : {}),
      },
    },
  );
}

export async function setKolamLayananCustomerVerification(params: {
  taskType: 'dosing' | 'maintenance';
  taskId: string;
  executionId: string;
  confirmed?: boolean;
  note?: string;
}): Promise<void> {
  await kolamRequest<unknown>(
    `${taskBasePath(params.taskType)}/${encodeURIComponent(params.taskId)}/executions/${encodeURIComponent(params.executionId)}/customer-verification`,
    {
      method: 'PUT',
      body: {
        confirmed: params.confirmed !== false,
        note: params.note ?? '',
      },
    },
  );
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
