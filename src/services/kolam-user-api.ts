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
