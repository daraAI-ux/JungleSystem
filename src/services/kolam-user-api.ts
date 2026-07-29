import {appConfig} from '../config/app';
import {
  normalizeKolamUserListResult,
  type KolamUserListQuery,
  type KolamUserListResult,
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

function kolamRequest<T>(
  path: string,
  options: {
    method?: 'GET';
    query?: Record<string, string | number | boolean | undefined | null>;
  } = {},
) {
  return apiRequest<T>({
    method: options.method ?? 'GET',
    path,
    query: options.query,
    baseUrl: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}
