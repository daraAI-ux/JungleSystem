import {appConfig} from '../config/app';
import {
  normalizeKolamUserDetail,
  normalizeKolamUserListResult,
  normalizeKolamUserRoles,
  type KolamUserCreatePayload,
  type KolamUserListItem,
  type KolamUserListQuery,
  type KolamUserListResult,
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
