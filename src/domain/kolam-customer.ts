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

export type KolamCustomerPointTransactionType =
  | 'earned'
  | 'used'
  | 'adjusted'
  | 'expired'
  | string;

export interface KolamCustomerPointTransactionSale {
  id: string;
  invoiceCode: string;
  finalTotal: number;
  status: string;
  createdAt: string;
}

export interface KolamCustomerPointTransactionUser {
  id: string;
  name: string;
  username: string;
}

export interface KolamCustomerPointTransaction {
  id: string;
  type: KolamCustomerPointTransactionType;
  method: string;
  description: string;
  points: number;
  sale: KolamCustomerPointTransactionSale | null;
  createdBy: KolamCustomerPointTransactionUser | null;
  createdAt: string;
}

export interface KolamCustomerPointTransactionsResult {
  items: KolamCustomerPointTransaction[];
  pagination: KolamCustomerPagination;
}

export interface KolamCustomerStorageProduct {
  id: string;
  name: string;
  slug: string;
  units: string;
}

export interface KolamCustomerStorageItem {
  id: string;
  product: KolamCustomerStorageProduct | null;
  variant: string;
  stock: number;
  totalStock: number;
  updatedAt: string;
}

export interface KolamCustomerStorageResult {
  items: KolamCustomerStorageItem[];
  pagination: KolamCustomerPagination;
}

export interface KolamCustomerProjectActivity {
  id: string;
  invoiceCode: string;
  lifecycleStatus: string;
  quotationNumber: string;
  taskTitle: string;
  createdAt: string;
}

export interface KolamCustomerSubscriptionActivity {
  id: string;
  invoiceCode: string;
  packageName: string;
  saleId: string;
  startDate: string;
  endDate: string;
  status: string;
  subscriptionNumber: string;
}

export interface KolamCustomerSaleActivity {
  id: string;
  invoiceCode: string;
  finalTotal: number;
  status: string;
  createdAt: string;
}

export interface KolamCustomerActivityResult {
  projects: KolamCustomerProjectActivity[];
  subscriptions: KolamCustomerSubscriptionActivity[];
  sales: KolamCustomerSaleActivity[];
}

export interface KolamCustomerSavePayload {
  address: string;
  email: string;
  gender: 'male' | 'female';
  name: string;
  notes: string;
  phone: string;
}

export function normalizeKolamCustomerListResult(
  payload: unknown,
  fallback: Required<Pick<KolamCustomerListQuery, 'limit' | 'page'>>,
): KolamCustomerListResult {
  const record = asRecord(payload);
  const rows = extractKolamCustomerRows(payload);

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

export function normalizeKolamCustomerPointTransactionsResult(
  payload: unknown,
  fallback: Required<Pick<KolamCustomerListQuery, 'limit' | 'page'>>,
): KolamCustomerPointTransactionsResult {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];
  const items = rows
    .map(normalizeKolamCustomerPointTransaction)
    .filter(
      (item): item is KolamCustomerPointTransaction => Boolean(item),
    );

  return {
    items,
    pagination: normalizeKolamCustomerPagination(
      record.pagination,
      items.length,
      fallback,
    ),
  };
}

export function normalizeKolamCustomerStorageResult(
  payload: unknown,
  fallback: Required<Pick<KolamCustomerListQuery, 'limit' | 'page'>>,
): KolamCustomerStorageResult {
  const record = asRecord(payload);
  const rows = Array.isArray(record.data)
    ? record.data
    : Array.isArray(payload)
      ? payload
      : [];
  const items = rows
    .map(normalizeKolamCustomerStorageItem)
    .filter((item): item is KolamCustomerStorageItem => Boolean(item));

  return {
    items,
    pagination: normalizeKolamCustomerPagination(
      record.pagination,
      items.length,
      fallback,
    ),
  };
}

export function normalizeKolamCustomerActivityResult({
  projects,
  sales,
  subscriptions,
}: {
  projects: unknown;
  sales: unknown;
  subscriptions: unknown;
}): KolamCustomerActivityResult {
  return {
    projects: extractKolamCustomerRows(projects)
      .map(normalizeKolamCustomerProjectActivity)
      .filter((item): item is KolamCustomerProjectActivity => Boolean(item)),
    sales: extractKolamCustomerRows(sales)
      .map(normalizeKolamCustomerSaleActivity)
      .filter((item): item is KolamCustomerSaleActivity => Boolean(item)),
    subscriptions: extractKolamCustomerRows(subscriptions)
      .map(normalizeKolamCustomerSubscriptionActivity)
      .filter(
        (item): item is KolamCustomerSubscriptionActivity => Boolean(item),
      ),
  };
}

export function normalizeKolamCustomer(value: unknown): KolamCustomer | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  const name =
    getString(record, 'name') ||
    getString(record, 'username') ||
    getString(record, 'email');

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

function normalizeKolamCustomerPointTransaction(
  value: unknown,
): KolamCustomerPointTransaction | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  return {
    createdAt: getString(record, 'createdAt'),
    createdBy: normalizeKolamCustomerPointTransactionUser(record.createdBy),
    description: getString(record, 'description'),
    id,
    method: getString(record, 'method'),
    points: getNumber(record, 'points') ?? 0,
    sale: normalizeKolamCustomerPointTransactionSale(record.sale),
    type: getString(record, 'type'),
  };
}

function normalizeKolamCustomerPointTransactionSale(
  value: unknown,
): KolamCustomerPointTransactionSale | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  return {
    createdAt: getString(record, 'createdAt'),
    finalTotal: getNumber(record, 'finalTotal') ?? 0,
    id,
    invoiceCode: getString(record, 'invoiceCode'),
    status: getString(record, 'status'),
  };
}

function normalizeKolamCustomerPointTransactionUser(
  value: unknown,
): KolamCustomerPointTransactionUser | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  const firstName = getString(record, 'first_name');
  const lastName = getString(record, 'last_name');
  const name = [firstName, lastName].filter(Boolean).join(' ');

  return {
    id,
    name: name || getString(record, 'name') || getString(record, 'username'),
    username: getString(record, 'username'),
  };
}

function normalizeKolamCustomerStorageItem(
  value: unknown,
): KolamCustomerStorageItem | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  return {
    id,
    product: normalizeKolamCustomerStorageProduct(record.product),
    stock: getNumber(record, 'stock') ?? 0,
    totalStock: getNumber(record, 'totalStock') ?? 0,
    updatedAt: getString(record, 'updatedAt'),
    variant:
      getString(record, 'variant') ||
      getString(asRecord(record.variant), '_id') ||
      getString(asRecord(record.variant), 'id'),
  };
}

function normalizeKolamCustomerStorageProduct(
  value: unknown,
): KolamCustomerStorageProduct | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  return {
    id,
    name: getString(record, 'name') || 'Item',
    slug: getString(record, 'slug'),
    units: getString(record, 'units'),
  };
}

function normalizeKolamCustomerProjectActivity(
  value: unknown,
): KolamCustomerProjectActivity | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  const sale = asRecord(record.sale);
  const task = asRecord(record.linkedTask);

  return {
    createdAt: getString(record, 'createdAt'),
    id,
    invoiceCode: getString(sale, 'invoiceCode'),
    lifecycleStatus: getString(record, 'lifecycleStatus'),
    quotationNumber: getString(record, 'quotationNumber'),
    taskTitle: getString(task, 'title'),
  };
}

function normalizeKolamCustomerSubscriptionActivity(
  value: unknown,
): KolamCustomerSubscriptionActivity | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  const sale = asRecord(record.sale);
  const service = asRecord(record.service);

  return {
    endDate: getString(record, 'endDate'),
    id,
    invoiceCode: getString(sale, 'invoiceCode'),
    packageName:
      getString(service, 'name') ||
      getString(record, 'packageCode') ||
      getString(record, 'packageName'),
    saleId:
      getString(sale, '_id') ||
      getString(sale, 'id') ||
      getString(record, 'sale'),
    startDate: getString(record, 'startDate'),
    status: getString(record, 'status'),
    subscriptionNumber: getString(record, 'subscriptionNumber'),
  };
}

function normalizeKolamCustomerSaleActivity(
  value: unknown,
): KolamCustomerSaleActivity | null {
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');

  if (!id) {
    return null;
  }

  return {
    createdAt: getString(record, 'createdAt'),
    finalTotal: getNumber(record, 'finalTotal') ?? 0,
    id,
    invoiceCode: getString(record, 'invoiceCode'),
    status: getString(record, 'status'),
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

function extractKolamCustomerRows(payload: unknown) {
  const record = asRecord(payload);
  const dataRecord = asRecord(record.data);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(record.data)) {
    return record.data;
  }

  if (Array.isArray(dataRecord.data)) {
    return dataRecord.data;
  }

  return [];
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
