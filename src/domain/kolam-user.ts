export type KolamUserSortOrder = 'asc' | 'desc';
export type KolamUserBooleanFilter = 'true' | 'false' | 'all';
export type KolamUserAccessId = 'inventory' | 'pos' | 'am';
export type KolamUserRouteMode =
  | 'create'
  | 'detail'
  | 'edit'
  | 'list'
  | 'unknown';

export const KOLAM_USER_LIST_ROUTE = '/list-of-users';

export function isKolamUserListRoute(route?: string | null) {
  const routePath = (route?.split('?')[0] ?? '').replace(/\/+$/, '') || '/';

  return routePath === KOLAM_USER_LIST_ROUTE;
}

export function isKolamUserRoute(route?: string | null) {
  return getKolamUserRouteMode(route) !== 'unknown';
}

export function getKolamUserRouteMode(route?: string | null): KolamUserRouteMode {
  const routePath = (route?.split('?')[0] ?? '').replace(/\/+$/, '') || '/';

  if (routePath === KOLAM_USER_LIST_ROUTE) {
    return 'list';
  }

  if (routePath === '/list-of-users/users/create') {
    return 'create';
  }

  if (/^\/list-of-users\/users\/[^/]+\/edit$/.test(routePath)) {
    return 'edit';
  }

  if (/^\/list-of-users\/users\/[^/]+$/.test(routePath)) {
    return 'detail';
  }

  return 'unknown';
}

export function getKolamUserIdFromRoute(route?: string | null) {
  const routePath = (route?.split('?')[0] ?? '').replace(/\/+$/, '') || '/';
  const match = routePath.match(/^\/list-of-users\/users\/([^/]+)(?:\/edit)?$/);

  return match ? decodeURIComponent(match[1]) : '';
}

export interface KolamUserRole {
  id: string;
  key: string;
  name: string;
}

export interface KolamUserRoleOption extends KolamUserRole {}

export interface KolamUserCreatePayload {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number: string;
  role: string;
}

export interface KolamUserUpdatePayload {
  id: string;
  username?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  timezone: string;
  role: string;
  password?: string;
}

export interface KolamUserAccessBadge {
  id: KolamUserAccessId;
  label: string;
}

export interface KolamUserListItem {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  role: KolamUserRole | null;
  roleLabel: string;
  profilePicture: string;
  timezone: string;
  statusOnline: boolean;
  lastOnline: string;
  accountRestricted: boolean;
  accessInventory: boolean;
  accessPos: boolean;
  accessAm: boolean;
  accessBadges: KolamUserAccessBadge[];
  isEmployee: boolean;
  isOwner: boolean;
  csActive: boolean;
  resignedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface KolamUserListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  prevStatus: boolean;
  nextStatus: boolean;
}

export interface KolamUserListQuery {
  accountRestricted?: KolamUserBooleanFilter;
  commissionEligible?: 'true';
  includeResigned?: 'true' | 'false';
  isEmployee?: KolamUserBooleanFilter;
  isOwner?: KolamUserBooleanFilter;
  limit?: number;
  order?: KolamUserSortOrder;
  page?: number;
  phoneNumber?: string;
  role?: string;
  roleId?: string;
  search?: string;
  sort?: string;
}

export interface KolamUserListResult {
  items: KolamUserListItem[];
  pagination: KolamUserListPagination;
}

export function normalizeKolamUserListResult(
  payload: unknown,
  fallback: Required<Pick<KolamUserListQuery, 'limit' | 'page'>>,
): KolamUserListResult {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  const items = rows
    .map(normalizeKolamUserListItem)
    .filter((item): item is KolamUserListItem => Boolean(item));

  return {
    items,
    pagination: normalizeKolamUserListPagination(
      record.pagination ?? record.meta,
      items.length,
      fallback,
    ),
  };
}

export function normalizeKolamUserListItem(
  value: unknown,
): KolamUserListItem | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  const firstName = getString(record, 'first_name') || getString(record, 'firstName');
  const lastName = getString(record, 'last_name') || getString(record, 'lastName');
  const username = getString(record, 'username');
  const email = getString(record, 'email');
  const displayName =
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    getString(record, 'name') ||
    username ||
    email ||
    id;
  const accessInventory = getBoolean(record, 'access_inventory') ?? false;
  const accessPos = getBoolean(record, 'access_pos') ?? false;
  const accessAm = getBoolean(record, 'access_am') ?? false;
  const role = normalizeKolamUserRole(record.role);

  return {
    accessAm,
    accessBadges: getKolamUserAccessBadges({
      accessAm,
      accessInventory,
      accessPos,
    }),
    accessInventory,
    accessPos,
    accountRestricted: getBoolean(record, 'account_restricted') ?? false,
    createdAt: getString(record, 'createdAt') || getString(record, 'created_at'),
    csActive: getBoolean(record, 'csActive') ?? false,
    displayName,
    email,
    firstName,
    id,
    isEmployee: getBoolean(record, 'isEmployee') ?? false,
    isOwner: getBoolean(record, 'isOwner') ?? false,
    lastName,
    phoneNumber:
      getString(record, 'phone_number') || getString(record, 'phoneNumber'),
    profilePicture: getString(record, 'profile_picture'),
    resignedAt: getString(record, 'resignedAt'),
    role,
    roleLabel: getKolamUserRoleLabel(role, record.role),
    lastOnline:
      getString(record, 'last_online') || getString(record, 'lastOnline'),
    statusOnline: getBoolean(record, 'status_online') ?? false,
    timezone: getString(record, 'timezone'),
    updatedAt: getString(record, 'updatedAt') || getString(record, 'updated_at'),
    username,
  };
}

export function normalizeKolamUserDetail(payload: unknown) {
  return normalizeKolamUserListItem(payload);
}

export function normalizeKolamUserRoles(payload: unknown): KolamUserRoleOption[] {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  return rows.map(normalizeKolamUserRole).filter(Boolean) as KolamUserRoleOption[];
}

export function getKolamUserEmployeeStatusLabel(user: KolamUserListItem) {
  return user.isEmployee ? 'Karyawan' : 'Bukan karyawan';
}

export function getKolamUserAccountStatusLabel(user: KolamUserListItem) {
  if (user.resignedAt) {
    return 'Resign';
  }

  return user.accountRestricted ? 'Dibatasi' : 'Aktif';
}

export function getKolamUserAccessSummary(user: KolamUserListItem) {
  return user.accessBadges.length
    ? user.accessBadges.map(item => item.label).join(', ')
    : 'Tidak ada';
}

function normalizeKolamUserRole(value: unknown): KolamUserRole | null {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized ? {id: '', key: normalized, name: normalized} : null;
  }

  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const key = getString(record, 'key');
  const name = getString(record, 'name') || key || id;

  if (!id && !key && !name) {
    return null;
  }

  return {id, key, name};
}

function getKolamUserRoleLabel(role: KolamUserRole | null, rawRole: unknown) {
  if (role?.name) {
    return role.name;
  }

  if (typeof rawRole === 'string' && rawRole.trim()) {
    return rawRole.trim();
  }

  return 'user';
}

function getKolamUserAccessBadges(input: {
  accessAm: boolean;
  accessInventory: boolean;
  accessPos: boolean;
}): KolamUserAccessBadge[] {
  const badges: KolamUserAccessBadge[] = [];

  if (input.accessInventory) {
    badges.push({id: 'inventory', label: 'Inventory'});
  }

  if (input.accessPos) {
    badges.push({id: 'pos', label: 'POS'});
  }

  if (input.accessAm) {
    badges.push({id: 'am', label: 'AM'});
  }

  return badges;
}

function normalizeKolamUserListPagination(
  value: unknown,
  itemCount: number,
  fallback: Required<Pick<KolamUserListQuery, 'limit' | 'page'>>,
): KolamUserListPagination {
  const record = asRecord(value);
  const page = Math.max(
    1,
    getNumber(record, 'currentPage') ?? getNumber(record, 'page') ?? fallback.page,
  );
  const limit = Math.max(1, getNumber(record, 'limit') ?? fallback.limit);
  const total = Math.max(
    0,
    getNumber(record, 'totalDocuments') ?? getNumber(record, 'total') ?? itemCount,
  );
  const totalPages =
    getNumber(record, 'totalPages') ?? Math.max(1, Math.ceil(total / limit));
  const safeTotalPages = Math.max(1, totalPages);

  return {
    hasMore: getBoolean(record, 'hasMore') ?? page < safeTotalPages,
    limit,
    nextStatus: getBoolean(record, 'nextStatus') ?? page < safeTotalPages,
    page,
    prevStatus: getBoolean(record, 'prevStatus') ?? page > 1,
    total,
    totalPages: safeTotalPages,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === 'boolean' ? value : null;
}
