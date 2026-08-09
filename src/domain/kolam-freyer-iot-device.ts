export type KolamFreyerIotConnectionState =
  | 'online'
  | 'stale'
  | 'offline'
  | 'unknown';

export interface KolamFreyerIotConnection {
  state: KolamFreyerIotConnectionState;
  online: boolean;
  lastSeenAt: string;
  serial: string;
  clientCount: number;
}

export interface KolamFreyerIotDevice {
  id: string;
  name: string;
  serialNumber: string;
  customerLabel: string;
  status: number;
  statusLabel: 'On' | 'Off';
  waterLevelStatus: number;
  updatedAt: string;
  iotConnection: KolamFreyerIotConnection | null;
  raw: unknown;
}

export interface KolamFreyerIotDevicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamFreyerIotDeviceListResult {
  data: KolamFreyerIotDevice[];
  pagination: KolamFreyerIotDevicePagination;
}

export function normalizeKolamFreyerIotDeviceList(
  payload: unknown,
): KolamFreyerIotDeviceListResult {
  const root = asRecord(payload);
  const dataRecord = asRecord(root.data);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(dataRecord.data)
    ? dataRecord.data
    : Array.isArray(root.items)
    ? root.items
    : [];
  const paginationRecord = asRecord(root.pagination);
  const nestedPaginationRecord = asRecord(dataRecord.pagination);
  const paginationSource =
    Object.keys(nestedPaginationRecord).length > 0
      ? nestedPaginationRecord
      : paginationRecord;
  const total =
    getNumber(paginationSource, 'total') ||
    getNumber(root, 'total') ||
    getNumber(dataRecord, 'total') ||
    list.length;
  const limit =
    getNumber(paginationSource, 'limit') ||
    getNumber(root, 'limit') ||
    50;
  const page =
    getNumber(paginationSource, 'page') || getNumber(root, 'page') || 1;
  const totalPages =
    getNumber(paginationSource, 'totalPages') ||
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    data: list.map(normalizeKolamFreyerIotDevice),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function normalizeKolamFreyerIotDevice(
  value: unknown,
): KolamFreyerIotDevice {
  const record = asRecord(value);
  const attachedPurchase = asRecord(record.attachedPurchase);
  const production = asRecord(record.production);
  const customer = asRecord(record.customer);
  const status = getNumber(record, 'status');
  const serialNumber =
    getString(attachedPurchase, 'serialNumber') ||
    getString(production, 'serial_number') ||
    getString(production, 'serialNumber');

  return {
    id: getId(record),
    name: getString(record, 'name') || '—',
    serialNumber: serialNumber || '—',
    customerLabel:
      getString(customer, 'name') ||
      getString(customer, 'email') ||
      (typeof record.customer === 'string' ? record.customer.trim() : '') ||
      '—',
    status,
    statusLabel: status === 1 ? 'On' : 'Off',
    waterLevelStatus: getNumber(record, 'water_level_status'),
    updatedAt: getString(record, 'updatedAt'),
    iotConnection: normalizeIotConnection(record.iotConnection),
    raw: value,
  };
}

function normalizeIotConnection(
  value: unknown,
): KolamFreyerIotConnection | null {
  if (value == null) {
    return null;
  }

  const record = asRecord(value);
  const stateRaw = getString(record, 'state').toLowerCase();
  const state: KolamFreyerIotConnectionState =
    stateRaw === 'online' ||
    stateRaw === 'stale' ||
    stateRaw === 'offline' ||
    stateRaw === 'unknown'
      ? stateRaw
      : getBoolean(record, 'online')
      ? 'online'
      : 'unknown';

  return {
    state,
    online: getBoolean(record, 'online') || state === 'online',
    lastSeenAt: getString(record, 'lastSeenAt'),
    serial: getString(record, 'serial'),
    clientCount: getNumber(record, 'clientCount'),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getId(record: Record<string, unknown>) {
  return getString(record, '_id') || getString(record, 'id');
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

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return false;
}
