import {appConfig} from '../config/app';
import {
  normalizeKolamHrDailyAttendanceSummary,
  normalizeKolamHrLeaveRequestList,
  type KolamHrDailyAttendanceSummary,
  type KolamHrLeaveRequest,
  type KolamHrLeaveType,
} from '../domain/kolam-hr';
import {apiRequest} from '../lib/api-client';

export async function fetchKolamHrDailyAttendanceSummary(
  dateKey: string,
): Promise<KolamHrDailyAttendanceSummary | null> {
  const payload = await kolamRequest<unknown>(
    '/staff-attendance/daily-summary',
    {
      query: {dateKey},
    },
  );
  return normalizeKolamHrDailyAttendanceSummary(payload);
}

export async function fetchKolamHrLeaveRequests(input?: {
  status?: string;
  limit?: number;
}): Promise<KolamHrLeaveRequest[]> {
  const payload = await kolamRequest<unknown>(
    '/staff-attendance/leave-requests',
    {
      query: {
        ...(input?.status ? {status: input.status} : {}),
        limit: input?.limit ?? 50,
      },
    },
  );
  return normalizeKolamHrLeaveRequestList(payload);
}

export async function createKolamHrLeaveRequest(body: {
  userId: string;
  type: KolamHrLeaveType | string;
  startDateKey: string;
  endDateKey: string;
  reason?: string;
}): Promise<void> {
  await kolamRequest('/staff-attendance/leave-requests', {
    method: 'POST',
    body: {
      userId: body.userId,
      type: body.type,
      startDateKey: body.startDateKey,
      endDateKey: body.endDateKey,
      ...(body.reason?.trim() ? {reason: body.reason.trim()} : {}),
    },
  });
}

export async function reviewKolamHrLeaveRequest(input: {
  id: string;
  approve: boolean;
  rejectionReason?: string;
}): Promise<void> {
  await kolamRequest(
    `/staff-attendance/leave-requests/${encodeURIComponent(input.id)}/review`,
    {
      method: 'POST',
      body: {
        approve: input.approve,
        ...(input.rejectionReason?.trim()
          ? {rejectionReason: input.rejectionReason.trim()}
          : {}),
      },
    },
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
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    body: options.body,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}
