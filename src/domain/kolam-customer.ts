export type KolamCustomerGender = 'male' | 'female' | 'other' | string;
export type KolamCustomerStatus = 'active' | 'inactive' | 'blacklisted' | string;
export type KolamCustomerExternalPlatform = 'tokopedia' | 'shopee' | string;

export interface KolamCustomerAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  notes: string;
  isDefault: boolean;
}

export interface KolamCustomerExternalAccount {
  platform: KolamCustomerExternalPlatform;
  externalId: string;
  externalName: string;
  linkedAt: string;
}

export interface KolamCustomerPoints {
  totalPoints: number;
  availablePoints: number;
  lifetimePoints: number;
}

export interface KolamCustomer {
  id: string;
  name: string;
  gender: KolamCustomerGender;
  address: string;
  phone: string;
  email: string;
  notes: string;
  photos: string[];
  status: KolamCustomerStatus;
  username: string;
  verifiedStatus: boolean;
  accountRestricted: boolean;
  points: KolamCustomerPoints;
  addresses: KolamCustomerAddress[];
  externalAccounts: KolamCustomerExternalAccount[];
  createdAt: string;
  updatedAt: string;
}

export interface KolamCustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamCustomerListQuery {
  limit?: number;
  page?: number;
  search?: string;
}

export interface KolamCustomerListResult {
  items: KolamCustomer[];
  pagination: KolamCustomerPagination;
}

export function normalizeKolamCustomerListResult(
  payload: unknown,
  fallback: Required<Pick<KolamCustomerListQuery, 'limit' | 'page'>>,
): KolamCustomerListResult {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];

  const items = rows
    .map(normalizeKolamCustomer)
    .filter((item): item is KolamCustomer => Boolean(item));

  return {
    items,
    pagination: normalizeKolamCustomerPagination(
      record.pagination,
      items.length,
      fallback,
    ),
  };
}

export function normalizeKolamCustomerDetail(payload: unknown) {
  const record = asRecord(payload);
  return normalizeKolamCustomer(record.data ?? payload);
}

export function normalizeKolamCustomer(value: unknown): KolamCustomer | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name');

  if (!id || !name) {
    return null;
  }

  return {
    accountRestricted: getBoolean(record, 'account_restricted') ?? false,
    address: getString(record, 'address'),
    addresses: normalizeKolamCustomerAddresses(record.addresses),
    createdAt: getString(record, 'createdAt'),
    email: getString(record, 'email'),
    externalAccounts: normalizeKolamCustomerExternalAccounts(
      record.externalAccounts,
    ),
    gender: getString(record, 'gender'),
    id,
    name,
    notes: getString(record, 'notes'),
    phone: getString(record, 'phone'),
    photos: normalizeStringList(record.photos),
    points: normalizeKolamCustomerPoints(record.points),
    status: getString(record, 'status'),
    updatedAt: getString(record, 'updatedAt'),
    username: getString(record, 'username'),
    verifiedStatus: getBoolean(record, 'verified_status') ?? false,
  };
}

export function getKolamCustomerPrimaryAddress(customer: KolamCustomer) {
  return (
    customer.addresses.find(address => address.isDefault) ??
    customer.addresses[0] ??
    null
  );
}

export function getKolamCustomerLocationText(customer: KolamCustomer) {
  const primaryAddress = getKolamCustomerPrimaryAddress(customer);

  if (primaryAddress) {
    const location = [primaryAddress.city, primaryAddress.province]
      .filter(Boolean)
      .join(', ');

    if (location) {
      return location;
    }
  }

  return customer.address;
}

function normalizeKolamCustomerPagination(
  value: unknown,
  itemCount: number,
  fallback: Required<Pick<KolamCustomerListQuery, 'limit' | 'page'>>,
): KolamCustomerPagination {
  const record = asRecord(value);
  const page = Math.max(1, getNumber(record, 'page') ?? fallback.page);
  const limit = Math.max(1, getNumber(record, 'limit') ?? fallback.limit);
  const total = Math.max(0, getNumber(record, 'total') ?? itemCount);
  const totalPages =
    getNumber(record, 'totalPages') ?? Math.max(1, Math.ceil(total / limit));

  return {limit, page, total, totalPages: Math.max(1, totalPages)};
}

function normalizeKolamCustomerAddresses(value: unknown) {
  return Array.isArray(value)
    ? value
        .map(normalizeKolamCustomerAddress)
        .filter((item): item is KolamCustomerAddress => Boolean(item))
    : [];
}

function normalizeKolamCustomerAddress(
  value: unknown,
): KolamCustomerAddress | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  return {
    addressLine1: getString(record, 'addressLine1'),
    addressLine2: getString(record, 'addressLine2'),
    city: getString(record, 'city'),
    country: getString(record, 'country'),
    id,
    isDefault: getBoolean(record, 'isDefault') ?? false,
    label: getString(record, 'label'),
    notes: getString(record, 'notes'),
    phone: getString(record, 'phone'),
    postalCode: getString(record, 'postalCode'),
    province: getString(record, 'province'),
    recipientName: getString(record, 'recipientName'),
  };
}

function normalizeKolamCustomerExternalAccounts(value: unknown) {
  return Array.isArray(value)
    ? value
        .map(normalizeKolamCustomerExternalAccount)
        .filter((item): item is KolamCustomerExternalAccount => Boolean(item))
    : [];
}

function normalizeKolamCustomerExternalAccount(
  value: unknown,
): KolamCustomerExternalAccount | null {
  const record = asRecord(value);
  const platform = getString(record, 'platform');
  const externalId = getString(record, 'externalId');

  if (!platform || !externalId) {
    return null;
  }

  return {
    externalId,
    externalName: getString(record, 'externalName'),
    linkedAt: getString(record, 'linkedAt'),
    platform,
  };
}

function normalizeKolamCustomerPoints(value: unknown): KolamCustomerPoints {
  const record = asRecord(value);

  return {
    availablePoints: getNumber(record, 'availablePoints') ?? 0,
    lifetimePoints: getNumber(record, 'lifetimePoints') ?? 0,
    totalPoints: getNumber(record, 'totalPoints') ?? 0,
  };
}

function normalizeStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
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
