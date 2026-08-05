export type KolamNotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'system'
  | 'order'
  | 'payment'
  | 'inventory'
  | 'user';

export interface KolamNotificationRelatedEntity {
  type?: string;
  id?: string;
}

export interface KolamNotification {
  _id: string;
  title: string;
  message: string;
  type: KolamNotificationType;
  category?: string;
  isRead: boolean;
  userId?: string;
  link?: string;
  relatedEntity?: KolamNotificationRelatedEntity;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

export interface KolamNotificationPaginationMeta {
  from: number;
  hasMore: boolean;
  page: number;
  perPage: number;
  to: number;
  totalData: number;
}

export interface KolamNotificationsResult {
  data: KolamNotification[];
  pagination: KolamNotificationPaginationMeta;
}

export interface KolamNotificationStats {
  total: number;
  unread: number;
  read: number;
}

export function normalizeKolamNotificationsResult(
  payload: unknown,
  fallbackPage = 1,
  fallbackLimit = 20,
): KolamNotificationsResult {
  const record = asRecord(payload);
  const dataValue = Array.isArray(record?.data) ? record?.data : payload;
  const rows = Array.isArray(dataValue)
    ? dataValue
        .map(normalizeKolamNotification)
        .filter((item): item is KolamNotification => Boolean(item))
    : [];
  const paginationRecord =
    asRecord(record?.pagination) ?? asRecord(record?.meta);

  return {
    data: rows,
    pagination: normalizePaginationMeta(
      paginationRecord,
      fallbackPage,
      fallbackLimit,
      rows.length,
    ),
  };
}

export function normalizeKolamNotificationStats(
  payload: unknown,
): KolamNotificationStats {
  const record = asRecord(payload);
  const data = asRecord(record?.data) ?? record;

  return {
    total: getNumber(data, 'total'),
    unread:
      getOptionalNumber(data, 'unread') ?? getOptionalNumber(data, 'count') ?? 0,
    read: getNumber(data, 'read'),
  };
}

export function normalizeKolamNotification(
  value: unknown,
): KolamNotification | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }

  const relatedEntity = normalizeRelatedEntity(record.relatedEntity);
  const metadata = asRecord(record.metadata);

  return {
    _id: id,
    title: getString(record, 'title') || 'Notifikasi Kolam',
    message: getString(record, 'message'),
    type: normalizeNotificationType(record.type),
    category: getString(record, 'category') || undefined,
    isRead: getBoolean(record, 'isRead') ?? Boolean(record.readAt),
    userId: getString(record, 'userId') || undefined,
    link: getString(record, 'link') || undefined,
    relatedEntity,
    metadata: metadata ?? undefined,
    createdAt: getString(record, 'createdAt') || new Date(0).toISOString(),
    updatedAt: getString(record, 'updatedAt') || '',
    readAt: getString(record, 'readAt') || undefined,
  };
}

export function getKolamNotificationLink(
  notification: KolamNotification,
): string {
  if (notification.link) {
    return notification.link;
  }

  const metaLink = notification.metadata?.link;
  if (typeof metaLink === 'string' && metaLink) {
    return metaLink;
  }

  const {type, id} = notification.relatedEntity ?? {};
  if (type === 'Kasbon' && typeof notification.metadata?.userId === 'string') {
    return `/list-of-users/users/${notification.metadata.userId}`;
  }
  if (type === 'PurchaseOrder' && id) {
    return `/purchase-order/${id}`;
  }
  if ((type === 'Invoice' || type === 'Sale') && id) {
    return `/sales/${id}`;
  }
  if (type === 'CustomProject' && id) {
    return `/proyek/${id}`;
  }
  if (type === 'TaskManager' && id) {
    return `/task-manager/${id}`;
  }

  return `/notifications/${notification._id}`;
}

export function formatKolamNotificationDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function normalizePaginationMeta(
  record: Record<string, unknown> | null,
  fallbackPage: number,
  fallbackLimit: number,
  visibleCount: number,
): KolamNotificationPaginationMeta {
  const page = getOptionalNumber(record, 'page') ?? fallbackPage;
  const perPage =
    getOptionalNumber(record, 'perPage') ??
    getOptionalNumber(record, 'limit') ??
    fallbackLimit;
  const totalData =
    getOptionalNumber(record, 'totalData') ??
    getOptionalNumber(record, 'total') ??
    visibleCount;
  const from =
    getOptionalNumber(record, 'from') ??
    (totalData === 0 ? 0 : (page - 1) * perPage + 1);
  const to =
    getOptionalNumber(record, 'to') ??
    (totalData === 0 ? 0 : Math.min(from + visibleCount - 1, totalData));

  return {
    from,
    hasMore:
      getBoolean(record, 'hasMore') ?? page * perPage < Math.max(0, totalData),
    page,
    perPage,
    to,
    totalData,
  };
}

function normalizeRelatedEntity(
  value: unknown,
): KolamNotificationRelatedEntity | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const type = getString(record, 'type');
  const id = stringifyId(record.id);
  if (!type && !id) {
    return undefined;
  }

  return {type: type || undefined, id: id || undefined};
}

function normalizeNotificationType(value: unknown): KolamNotificationType {
  const type = String(value ?? '').toLowerCase();
  if (
    type === 'success' ||
    type === 'warning' ||
    type === 'error' ||
    type === 'system' ||
    type === 'order' ||
    type === 'payment' ||
    type === 'inventory' ||
    type === 'user'
  ) {
    return type;
  }

  return 'info';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function getString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  if (typeof value === 'string') {
    return value.trim();
  }

  return stringifyId(value);
}

function stringifyId(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (value && typeof value === 'object' && 'toString' in value) {
    const next = String(value);
    return next === '[object Object]' ? '' : next;
  }

  return '';
}

function getNumber(record: Record<string, unknown> | null, key: string) {
  return getOptionalNumber(record, key) ?? 0;
}

function getOptionalNumber(
  record: Record<string, unknown> | null,
  key: string,
) {
  const value = record?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getBoolean(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
  }

  return undefined;
}
