import {appConfig} from '../config/app';
import {
  normalizeKolamKasbonPendingSummary,
  normalizeKolamUserBonusList,
  normalizeKolamUserDeductionList,
  normalizeKolamUserAttendanceRecords,
  normalizeKolamUserAttendanceSettings,
  normalizeKolamUserDetail,
  normalizeKolamUserFaceEnrollment,
  normalizeKolamUserKasbonList,
  normalizeKolamUserListResult,
  normalizeKolamUserRatingList,
  normalizeKolamUserRatingSummary,
  normalizeKolamUserRoles,
  type KolamKasbonPendingSummary,
  type KolamUserAttendanceRecord,
  type KolamUserAttendanceSettings,
  type KolamUserBonusItem,
  type KolamUserCreatePayload,
  type KolamUserDeductionItem,
  type KolamUserFaceEnrollment,
  type KolamUserKasbonItem,
  type KolamUserListItem,
  type KolamUserListQuery,
  type KolamUserListResult,
  type KolamUserRatingListResult,
  type KolamUserRatingSummary,
  type KolamUserRoleOption,
  type KolamUserUpdatePayload,
} from '../domain/kolam-user';
import {apiRequest} from '../lib/api-client';

export async function getKolamUserList({
  accountRestricted,
  commissionEligible,
  includeResigned,
  isEmployee,
  isOwner,
  limit = 10,
  order,
  page = 1,
  phoneNumber,
  role,
  roleId,
  search,
  sort,
}: KolamUserListQuery = {}): Promise<KolamUserListResult> {
  const response = await kolamRequest<unknown>('/auth/get-all-user', {
    query: {
      limit,
      page,
      ...(accountRestricted && accountRestricted !== 'all'
        ? {account_restricted: accountRestricted}
        : {}),
      ...(commissionEligible ? {commissionEligible} : {}),
      ...(includeResigned ? {includeResigned} : {}),
      ...(isEmployee && isEmployee !== 'all' ? {isEmployee} : {}),
      ...(isOwner && isOwner !== 'all' ? {isOwner} : {}),
      ...(order ? {order} : {}),
      ...(phoneNumber?.trim() ? {phone_number: phoneNumber.trim()} : {}),
      ...(role?.trim() ? {role: role.trim()} : {}),
      ...(roleId?.trim() ? {roleId: roleId.trim()} : {}),
      ...(search?.trim() ? {search: search.trim()} : {}),
      ...(sort?.trim() ? {sort: sort.trim()} : {}),
    },
  });

  return normalizeKolamUserListResult(response, {limit, page});
}

export async function getKolamUserDetail(
  userId: string,
): Promise<KolamUserListItem | null> {
  const response = await kolamRequest<unknown>(
    `/auth/detail-user/${encodeURIComponent(userId)}`,
  );

  return normalizeKolamUserDetail(response);
}

export async function getKolamUserRoles(): Promise<KolamUserRoleOption[]> {
  const response = await kolamRequest<unknown>('/roles');

  return normalizeKolamUserRoles(response);
}

export async function getKolamKasbonPendingSummary(): Promise<KolamKasbonPendingSummary> {
  const response = await kolamRequest<unknown>('/salary/kasbon/pending-summary');

  return normalizeKolamKasbonPendingSummary(response);
}

export async function getKolamUserBonusList(
  userId: string,
): Promise<KolamUserBonusItem[]> {
  const response = await kolamRequest<unknown>(
    `/salary/bonus/${encodeURIComponent(userId)}`,
  );

  return normalizeKolamUserBonusList(response);
}

export async function getKolamUserDeductionList(
  userId: string,
): Promise<KolamUserDeductionItem[]> {
  const response = await kolamRequest<unknown>('/salary/deduction', {
    query: {userId},
  });

  return normalizeKolamUserDeductionList(response);
}

export async function getKolamUserKasbonList(
  userId: string,
): Promise<KolamUserKasbonItem[]> {
  const response = await kolamRequest<unknown>('/salary/kasbon', {
    query: {userId},
  });

  return normalizeKolamUserKasbonList(response);
}

export async function getKolamUserRatingSummary(
  staffId: string,
): Promise<KolamUserRatingSummary> {
  const response = await kolamRequest<unknown>(
    `/chat/ratings/staff/${encodeURIComponent(staffId)}/summary`,
  );

  return normalizeKolamUserRatingSummary(response);
}

export async function getKolamUserRatingList(
  staffId: string,
  options: {limit?: number; page?: number} = {},
): Promise<KolamUserRatingListResult> {
  const limit = options.limit ?? 10;
  const page = options.page ?? 1;
  const response = await kolamRequest<unknown>(
    `/chat/ratings/staff/${encodeURIComponent(staffId)}`,
    {
      query: {limit, page},
    },
  );

  return normalizeKolamUserRatingList(response, {limit, page});
}

export async function getKolamUserAttendanceSettings(): Promise<KolamUserAttendanceSettings> {
  const response = await kolamRequest<unknown>('/staff-attendance/settings');

  return normalizeKolamUserAttendanceSettings(response);
}

export async function getKolamUserAttendanceRecords(
  userId: string,
  periodKey: string,
): Promise<KolamUserAttendanceRecord[]> {
  const response = await kolamRequest<unknown>(
    `/staff-attendance/users/${encodeURIComponent(userId)}/records`,
    {
      query: {periodKey},
    },
  );

  return normalizeKolamUserAttendanceRecords(response);
}

export async function getKolamUserFaceEnrollment(
  userId: string,
): Promise<KolamUserFaceEnrollment | null> {
  const response = await kolamRequest<unknown>(
    `/staff-attendance/users/${encodeURIComponent(userId)}/face-enrollment`,
  );

  return normalizeKolamUserFaceEnrollment(response);
}

export async function createKolamUser(
  payload: KolamUserCreatePayload,
): Promise<KolamUserListItem | null> {
  const response = await kolamRequest<unknown>('/auth/create-user-by-admin', {
    body: payload,
    method: 'POST',
  });
  const record = response && typeof response === 'object'
    ? (response as Record<string, unknown>)
    : {};

  return normalizeKolamUserDetail(record.data ?? response);
}

export async function updateKolamUser(
  payload: KolamUserUpdatePayload,
): Promise<KolamUserListItem | null> {
  const response = await kolamRequest<unknown>('/auth/update-profile-by-admin', {
    body: payload,
    method: 'POST',
  });
  const record = response && typeof response === 'object'
    ? (response as Record<string, unknown>)
    : {};

  return normalizeKolamUserDetail(record.data ?? response);
}

export async function updateKolamUserSalary(payload: {
  salary: number;
  userId: string;
}) {
  return kolamRequest<unknown>('/salary/update', {
    body: payload,
    method: 'POST',
  });
}

export async function uploadKolamUserBiodataKtp(
  userId: string,
  localUri: string,
): Promise<KolamUserListItem | null> {
  const body = new FormData();
  body.append(
    'photos',
    createReactNativeFilePart(localUri, 'user-ktp-photo') as unknown as Blob,
  );

  const response = await kolamRequest<unknown>(
    `/auth/upload-biodata-ktp/${encodeURIComponent(userId)}`,
    {
      body,
      method: 'POST',
    },
  );
  const record = response && typeof response === 'object'
    ? (response as Record<string, unknown>)
    : {};

  return normalizeKolamUserDetail(record.data ?? response);
}

function kolamRequest<T>(
  path: string,
  options: {
    body?: unknown;
    method?: 'GET' | 'POST';
    query?: Record<string, string | number | boolean | undefined | null>;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    body: options.body,
    query: options.query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function createReactNativeFilePart(localUri: string, fallbackName: string) {
  const normalizedUri = localUri.startsWith('file://')
    ? localUri
    : `file:///${localUri.replace(/\\/g, '/')}`;
  const name = normalizedUri.split('/').pop() || fallbackName;

  return {
    name,
    type: inferFileMimeType(name),
    uri: normalizedUri,
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
      return 'image/jpeg';
    default:
      return 'image/jpeg';
  }
}
