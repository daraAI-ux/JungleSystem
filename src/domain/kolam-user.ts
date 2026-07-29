import { getKolamFileUrl } from '../lib/file-url';

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
  account_restricted?: boolean;
  access_am?: boolean;
  access_inventory?: boolean;
  access_pos?: boolean;
  csActive?: boolean;
  isEmployee?: boolean;
  isOwner?: boolean;
  username?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  timezone: string;
  role: string;
  password?: string;
  biodata?: KolamUserBiodataPayload;
  employee?: KolamUserEmployeePayload;
}

export interface KolamUserAccessBadge {
  id: KolamUserAccessId;
  label: string;
}

export interface KolamUserBiodataAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface KolamUserBiodataEmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface KolamUserBiodata {
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  address: KolamUserBiodataAddress;
  nationalId: string;
  photoKTP: string;
  photoKtpUri: string;
  taxNumber: string;
  maritalStatus: string;
  religion: string;
  emergencyContact: KolamUserBiodataEmergencyContact;
}

export interface KolamUserBiodataPayload {
  gender?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  address?: Partial<KolamUserBiodataAddress>;
  nationalId?: string;
  taxNumber?: string;
  maritalStatus?: string;
  religion?: string;
  emergencyContact?: Partial<KolamUserBiodataEmergencyContact>;
}

export interface KolamUserEmployeeSchedule {
  type: string;
  shiftStart: string;
  shiftEnd: string;
  workDays: string[];
}

export interface KolamUserEmployeeProfile {
  employeeNumber: string;
  position: string;
  department: string;
  status: string;
  hireDate: string;
  yearIn: number | null;
  firstTimeWorking: boolean;
  salary: number | null;
  salaryDate: number | null;
  schedule: KolamUserEmployeeSchedule;
  isPkp: boolean;
  pkpNotes: string;
}

export interface KolamUserEmployeePayload {
  employeeNumber?: string;
  position?: string;
  department?: string;
  status?: string;
  hireDate?: string;
  yearIn?: number;
  firstTimeWorking?: boolean;
  salaryDate?: number;
  schedule?: KolamUserEmployeeSchedule;
  isPkp?: boolean;
  pkpNotes?: string;
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
  biodata: KolamUserBiodata;
  employee: KolamUserEmployeeProfile;
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
    biodata: normalizeKolamUserBiodata(record.biodata),
    employee: normalizeKolamUserEmployee(record.employee),
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

function normalizeKolamUserBiodata(value: unknown): KolamUserBiodata {
  const record = asRecord(value);
  const address = asRecord(record.address);
  const emergencyContact = asRecord(record.emergencyContact);
  const photoKTP = getString(record, 'photoKTP');

  return {
    address: {
      city: getString(address, 'city'),
      postalCode: getString(address, 'postalCode'),
      province: getString(address, 'province'),
      street: getString(address, 'street'),
    },
    dateOfBirth: normalizeKolamUserDateString(record.dateOfBirth),
    emergencyContact: {
      name: getString(emergencyContact, 'name'),
      phone: getString(emergencyContact, 'phone'),
      relation: getString(emergencyContact, 'relation'),
    },
    gender: getString(record, 'gender'),
    maritalStatus: getString(record, 'maritalStatus'),
    nationalId: getString(record, 'nationalId'),
    placeOfBirth: getString(record, 'placeOfBirth'),
    photoKTP,
    photoKtpUri: getKolamFileUrl(photoKTP) ?? '',
    religion: getString(record, 'religion'),
    taxNumber: getString(record, 'taxNumber'),
  };
}

function normalizeKolamUserEmployee(value: unknown): KolamUserEmployeeProfile {
  const record = asRecord(value);
  const schedule = asRecord(record.schedule);
  const workDays = Array.isArray(schedule.workDays)
    ? schedule.workDays.filter((item): item is string => typeof item === 'string')
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return {
    department: getString(record, 'department'),
    employeeNumber: getString(record, 'employeeNumber'),
    firstTimeWorking: getBoolean(record, 'firstTimeWorking') ?? false,
    hireDate: normalizeKolamUserDateString(record.hireDate),
    isPkp: getBoolean(record, 'isPkp') ?? false,
    pkpNotes: getString(record, 'pkpNotes'),
    position: getString(record, 'position'),
    salary: getNumber(record, 'salary') ?? null,
    salaryDate: getNumber(record, 'salaryDate') ?? null,
    schedule: {
      shiftEnd: getString(schedule, 'shiftEnd') || '18:00',
      shiftStart: getString(schedule, 'shiftStart') || '09:00',
      type: getString(schedule, 'type') || 'full_time',
      workDays,
    },
    status: getString(record, 'status') || 'active',
    yearIn: getNumber(record, 'yearIn') ?? null,
  };
}

function normalizeKolamUserDateString(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return '';
  }

  const trimmed = value.trim();
  const [datePart] = trimmed.split('T');

  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : '';
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
