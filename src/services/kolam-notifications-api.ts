import {appConfig} from '../config/app';
import {apiRequest} from '../lib/api-client';
import {
  normalizeKolamNotification,
  normalizeKolamNotificationsResult,
  normalizeKolamNotificationStats,
  type KolamNotification,
  type KolamNotificationStats,
  type KolamNotificationType,
  type KolamNotificationsResult,
} from '../domain/kolam-notifications';

export interface GetKolamNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: KolamNotificationType;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getKolamNotifications({
  page = 1,
  limit = 20,
  isRead,
  type,
  category,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: GetKolamNotificationsParams = {}): Promise<KolamNotificationsResult> {
  const skip = Math.max(0, page - 1) * limit;
  const payload = await kolamNotificationRequest<unknown>('/notification', {
    query: {
      page,
      limit,
      skip,
      isRead,
      unreadOnly: isRead === false ? true : undefined,
      type,
      category,
      search,
      sortBy,
      sortOrder,
    },
  });

  return normalizeKolamNotificationsResult(payload, page, limit);
}

export async function getKolamNotificationStats(
  category?: string,
): Promise<KolamNotificationStats> {
  const payload = await kolamNotificationRequest<unknown>(
    '/notification/stats',
    {
      query: {category},
    },
  );

  return normalizeKolamNotificationStats(payload);
}

export async function getKolamNotification(
  id: string,
): Promise<KolamNotification | null> {
  const payload = await kolamNotificationRequest<unknown>(
    `/notification/${encodeURIComponent(id)}`,
  );
  const record =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as {data?: unknown}).data
      : payload;

  return normalizeKolamNotification(record);
}

export async function markKolamNotificationRead(
  id: string,
): Promise<KolamNotification | null> {
  const payload = await kolamNotificationRequest<unknown>(
    `/notification/${encodeURIComponent(id)}/read`,
    {method: 'PUT'},
  );
  const record =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as {data?: unknown}).data
      : payload;

  return normalizeKolamNotification(record);
}

export async function archiveKolamNotification(id: string): Promise<void> {
  await kolamNotificationRequest<unknown>(
    `/notification/${encodeURIComponent(id)}`,
    {method: 'DELETE'},
  );
}

export async function markAllKolamNotificationsRead(
  category?: string,
): Promise<void> {
  await kolamNotificationRequest<unknown>('/notification/read-all', {
    method: 'PUT',
    body: category ? {category} : {},
  });
}

export async function deleteAllKolamNotifications(
  category?: string,
): Promise<void> {
  await kolamNotificationRequest<unknown>('/notification/all', {
    method: 'DELETE',
    body: category ? {category} : {},
  });
}

function kolamNotificationRequest<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    query?: Record<string, string | number | boolean | undefined | null>;
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
