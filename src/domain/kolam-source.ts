import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';

export const KOLAM_SOURCE_ROOT = '/source';

export type KolamSourceType = 'online' | 'offline';
export type KolamSourceCostFieldType = 'percentage' | 'fixed';
export type KolamSourceCommissionRecipientMode =
  | 'pic'
  | 'owner'
  | 'equal_all_employees'
  | 'selected_users';

export interface KolamSourceCostField {
  name: string;
  type: KolamSourceCostFieldType;
  value: number;
}

export interface KolamSourceWalletRef {
  id: string;
  name: string;
  type: string;
}

export interface KolamSourceUserRef {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isOwner: boolean;
  isEmployee: boolean;
}

export interface KolamSource {
  id: string;
  name: string;
  type: KolamSourceType;
  description: string;
  costFields: KolamSourceCostField[];
  markupPercent: number;
  markupFixed: number;
  isActive: boolean;
  isMarketplace: boolean;
  commissionEnabled: boolean;
  commissionRecipientMode: KolamSourceCommissionRecipientMode;
  defaultCommissionRecipients: KolamSourceUserRef[];
  wallet: KolamSourceWalletRef | null;
  walletId: string | null;
  logo: string | null;
  logoUri: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdByLabel?: string;
  updatedByLabel?: string;
  raw: unknown;
}

export interface KolamSourceFormState {
  id?: string;
  name: string;
  type: KolamSourceType;
  description: string;
  costFields: KolamSourceCostField[];
  markupPercent: string;
  markupFixed: string;
  isActive: boolean;
  isMarketplace: boolean;
  commissionEnabled: boolean;
  commissionRecipientMode: KolamSourceCommissionRecipientMode;
  defaultCommissionRecipientIds: string[];
  walletId: string | null;
  pendingLogoLocalUri: string | null;
}

export interface KolamSourceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: KolamSourceType;
  isActive?: boolean;
}

export interface KolamSourceListResult {
  items: KolamSource[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface KolamSourceActiveOption {
  id: string;
  name: string;
  type: string;
  logoUri: string | null;
}

export const KOLAM_SOURCE_TYPE_OPTIONS: Array<{
  id: KolamSourceType;
  label: string;
  description: string;
}> = [
  {
    id: 'online',
    label: 'Online',
    description: 'Marketplace online atau platform e-commerce',
  },
  {
    id: 'offline',
    label: 'Offline',
    description: 'Toko fisik atau saluran penjualan offline',
  },
];

export const KOLAM_SOURCE_COMMISSION_MODE_OPTIONS: Array<{
  id: KolamSourceCommissionRecipientMode;
  label: string;
  description: string;
}> = [
  {
    id: 'pic',
    label: 'PIC / kasir',
    description:
      '100% ke staf yang membuat invoice. Jika tidak eligible → bagian toko.',
  },
  {
    id: 'owner',
    label: 'Pemilik',
    description: '100% ke user pemilik (isOwner).',
  },
  {
    id: 'equal_all_employees',
    label: 'Bagi rata semua karyawan',
    description: 'Dibagi rata ke karyawan aktif eligible.',
  },
  {
    id: 'selected_users',
    label: 'Bagi rata staf terpilih',
    description: 'Dibagi rata hanya ke user yang dipilih di bawah.',
  },
];

export function isKolamSourceRoute(route: string) {
  const path = route.split('?')[0];
  return path === KOLAM_SOURCE_ROOT || path.startsWith(`${KOLAM_SOURCE_ROOT}/`);
}

export function getKolamSourceRouteMode(
  route: string,
): 'list' | 'detail' | 'edit' | 'new' {
  const path = route.split('?')[0];
  if (path === `${KOLAM_SOURCE_ROOT}/create`) {
    return 'new';
  }
  if (/^\/source\/[^/]+\/edit$/.test(path)) {
    return 'edit';
  }
  if (/^\/source\/[^/]+$/.test(path) && path !== `${KOLAM_SOURCE_ROOT}/create`) {
    return 'detail';
  }
  return 'list';
}

export function getKolamSourceIdFromRoute(route: string): string | null {
  const path = route.split('?')[0];
  const editMatch = /^\/source\/([^/]+)\/edit$/.exec(path);
  if (editMatch?.[1]) {
    return decodeURIComponent(editMatch[1]);
  }
  const detailMatch = /^\/source\/([^/]+)$/.exec(path);
  if (detailMatch?.[1] && detailMatch[1] !== 'create') {
    return decodeURIComponent(detailMatch[1]);
  }
  return null;
}

export function createEmptyKolamSourceFormState(): KolamSourceFormState {
  return {
    name: '',
    type: 'online',
    description: '',
    costFields: [],
    markupPercent: '0',
    markupFixed: '0',
    isActive: true,
    isMarketplace: false,
    commissionEnabled: true,
    commissionRecipientMode: 'equal_all_employees',
    defaultCommissionRecipientIds: [],
    walletId: null,
    pendingLogoLocalUri: null,
  };
}

export function createKolamSourceFormState(
  source: KolamSource,
): KolamSourceFormState {
  return {
    id: source.id,
    name: source.name,
    type: source.type,
    description: source.description,
    costFields: source.costFields.map(field => ({ ...field })),
    markupPercent: String(source.markupPercent ?? 0),
    markupFixed: String(source.markupFixed ?? 0),
    isActive: source.isActive,
    isMarketplace: source.isMarketplace,
    commissionEnabled: source.commissionEnabled,
    commissionRecipientMode: source.isMarketplace
      ? 'equal_all_employees'
      : source.commissionRecipientMode,
    defaultCommissionRecipientIds: source.defaultCommissionRecipients.map(
      user => user.id,
    ),
    walletId: source.walletId,
    pendingLogoLocalUri: null,
  };
}

export function validateKolamSourceForm(
  form: KolamSourceFormState,
): string | null {
  const name = form.name.trim();
  if (!name) {
    return 'Nama sumber penjualan wajib diisi.';
  }
  if (name.length < 2) {
    return 'Nama sumber penjualan minimal 2 karakter.';
  }
  if (form.isMarketplace && !form.walletId?.trim()) {
    return 'Dompet wajib dipilih untuk sumber marketplace.';
  }

  const markupPercent = Number(form.markupPercent);
  if (!Number.isFinite(markupPercent) || markupPercent < 0 || markupPercent > 100) {
    return 'Markup persen harus antara 0–100.';
  }
  const markupFixed = Number(form.markupFixed);
  if (!Number.isFinite(markupFixed) || markupFixed < 0) {
    return 'Markup tetap harus bernilai >= 0.';
  }

  for (const field of form.costFields) {
    if (!field.name.trim()) {
      return 'Semua field biaya harus punya nama.';
    }
    if (!Number.isFinite(field.value) || field.value < 0) {
      return `Field biaya "${field.name}" harus bernilai >= 0.`;
    }
    if (field.type === 'percentage' && field.value > 100) {
      return `Persentase "${field.name}" tidak boleh melebihi 100%.`;
    }
  }

  return null;
}

export function createKolamSourceSavePayload(form: KolamSourceFormState) {
  const isMarketplace = form.isMarketplace;
  return {
    name: form.name.trim(),
    type: form.type,
    description: form.description.trim() || undefined,
    costFields: form.costFields.map(field => ({
      name: field.name.trim(),
      type: field.type,
      value: Number(field.value) || 0,
    })),
    markupPercent: Math.min(100, Math.max(0, Number(form.markupPercent) || 0)),
    markupFixed: Math.max(0, Math.round(Number(form.markupFixed) || 0)),
    isActive: form.isActive,
    isMarketplace,
    commissionEnabled: form.commissionEnabled,
    commissionRecipientMode: isMarketplace
      ? ('equal_all_employees' as const)
      : form.commissionRecipientMode,
    defaultCommissionRecipients: isMarketplace
      ? []
      : form.defaultCommissionRecipientIds,
    wallet: isMarketplace ? form.walletId : form.walletId || null,
  };
}

export function normalizeKolamSource(payload: unknown): KolamSource {
  const record = asRecord(unwrapData(payload));
  const id = getString(record, '_id') || getString(record, 'id');
  const name = getString(record, 'name') || 'Sumber tanpa nama';
  const typeRaw = getString(record, 'type').toLowerCase();
  const type: KolamSourceType = typeRaw === 'offline' ? 'offline' : 'online';
  const logo = getString(record, 'logo') || getString(record, 'logoUrl') || null;
  const wallet = normalizeWallet(record.wallet);
  const recipients = normalizeRecipients(record.defaultCommissionRecipients);
  const modeRaw = getString(record, 'commissionRecipientMode');

  return {
    id: id || name,
    name,
    type,
    description: getString(record, 'description'),
    costFields: normalizeCostFields(record.costFields),
    markupPercent: getNumber(record, 'markupPercent') ?? 0,
    markupFixed: getNumber(record, 'markupFixed') ?? 0,
    isActive: getBoolean(record, 'isActive') ?? true,
    isMarketplace: getBoolean(record, 'isMarketplace') ?? false,
    commissionEnabled: getBoolean(record, 'commissionEnabled') ?? true,
    commissionRecipientMode: normalizeCommissionMode(modeRaw),
    defaultCommissionRecipients: recipients,
    wallet,
    walletId: wallet?.id ?? (typeof record.wallet === 'string' ? record.wallet : null),
    logo,
    logoUri: logo ? getKolamFileUrl(logo) : null,
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    createdByLabel: formatUserLabel(record.createdBy) || undefined,
    updatedByLabel: formatUserLabel(record.updatedBy) || undefined,
    raw: payload,
  };
}

export function normalizeKolamSourceList(
  payload: unknown,
  query: KolamSourceListQuery = {},
): KolamSourceListResult {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
      ? rootRecord.data
      : Array.isArray(rootRecord.items)
        ? rootRecord.items
        : [];

  const pagination = asRecord(rootRecord.pagination);
  const limit = query.limit ?? getNumber(pagination, 'limit') ?? 10;
  const page = query.page ?? getNumber(pagination, 'page') ?? 1;
  const total =
    getNumber(pagination, 'total') ??
    getNumber(pagination, 'totalItems') ??
    list.length;
  const totalPages =
    getNumber(pagination, 'totalPages') ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items: list.map(normalizeKolamSource).filter(item => item.id),
    page,
    limit,
    total,
    totalPages,
  };
}

export function normalizeKolamSourceDetail(payload: unknown): KolamSource {
  return normalizeKolamSource(payload);
}

export function normalizeKolamActiveSourceOptions(
  payload: unknown,
): KolamSourceActiveOption[] {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
      ? rootRecord.data
      : [];

  return list
    .map(row => {
      const record = asRecord(row);
      const id = getString(record, '_id') || getString(record, 'id');
      if (!id) {
        return null;
      }
      const logo =
        getString(record, 'logo') || getString(record, 'logoUrl') || '';
      const typeRaw = getString(record, 'type').toLowerCase();
      return {
        id,
        name: getString(record, 'name') || id,
        type: typeRaw || '',
        logoUri: logo ? getKolamFileUrl(logo) : null,
      } satisfies KolamSourceActiveOption;
    })
    .filter((row): row is KolamSourceActiveOption => Boolean(row));
}

export function getKolamSourceTypeLabel(type: KolamSourceType) {
  return type === 'offline' ? 'Offline' : 'Online';
}

export function getKolamSourceStatusLabel(isActive: boolean) {
  return isActive ? 'Aktif' : 'Nonaktif';
}

export function getKolamSourceCommissionModeLabel(
  source: Pick<
    KolamSource,
    'isMarketplace' | 'commissionRecipientMode' | 'commissionEnabled'
  >,
) {
  if (!source.commissionEnabled) {
    return 'Komisi nonaktif';
  }
  if (source.isMarketplace) {
    return 'Bagi rata semua karyawan (olshop)';
  }
  return (
    KOLAM_SOURCE_COMMISSION_MODE_OPTIONS.find(
      option => option.id === source.commissionRecipientMode,
    )?.label ?? 'Bagi rata semua karyawan'
  );
}

export function getKolamSourcePricingMode(source: KolamSource): {
  label: string;
  detail: string;
} {
  if (source.isMarketplace) {
    return {
      label: 'Harga marketplace',
      detail:
        'Penjualan memakai field onlinePrice katalog (margin lebih rendah, disesuaikan untuk marketplace eksternal).',
    };
  }
  if (source.type === 'online') {
    return {
      label: 'Harga toko web langsung',
      detail: 'Penjualan memakai field price_to_sell katalog (ritel standar).',
    };
  }
  return {
    label: 'Harga ritel offline',
    detail:
      'Penjualan memakai field price_to_sell katalog (ritel toko fisik).',
  };
}

export function formatKolamSourceCostField(field: KolamSourceCostField) {
  if (field.type === 'percentage') {
    return `${field.name}: ${field.value}%`;
  }
  return `${field.name}: ${formatIdr(field.value)}`;
}

export function estimateKolamSourceCostOnAmount(
  costFields: KolamSourceCostField[],
  amount: number,
) {
  return costFields.reduce((total, field) => {
    if (field.type === 'percentage') {
      return total + (amount * field.value) / 100;
    }
    return total + field.value;
  }, 0);
}

export function formatKolamSourceUserDisplayName(
  user: Pick<
    KolamSourceUserRef,
    'firstName' | 'lastName' | 'username' | 'email'
  >,
) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.username || user.email || '(tanpa nama)';
}

function normalizeCostFields(value: unknown): KolamSourceCostField[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const record = asRecord(item);
      const name = getString(record, 'name');
      const typeRaw = getString(record, 'type').toLowerCase();
      const type: KolamSourceCostFieldType =
        typeRaw === 'fixed' ? 'fixed' : 'percentage';
      const fieldValue = getNumber(record, 'value') ?? 0;
      if (!name) {
        return null;
      }
      return { name, type, value: fieldValue };
    })
    .filter((item): item is KolamSourceCostField => Boolean(item));
}

function normalizeWallet(value: unknown): KolamSourceWalletRef | null {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const id = value.trim();
    return id ? { id, name: id, type: 'regular' } : null;
  }
  const record = asRecord(value);
  const id = getString(record, '_id') || getString(record, 'id');
  if (!id) {
    return null;
  }
  return {
    id,
    name: getString(record, 'name') || id,
    type: getString(record, 'type') || 'regular',
  };
}

function normalizeRecipients(value: unknown): KolamSourceUserRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      if (typeof item === 'string') {
        const id = item.trim();
        return id
          ? {
              id,
              firstName: '',
              lastName: '',
              username: '',
              email: '',
              isOwner: false,
              isEmployee: false,
            }
          : null;
      }
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      if (!id) {
        return null;
      }
      return {
        id,
        firstName: getString(record, 'first_name') || getString(record, 'firstName'),
        lastName: getString(record, 'last_name') || getString(record, 'lastName'),
        username: getString(record, 'username'),
        email: getString(record, 'email'),
        isOwner: getBoolean(record, 'isOwner') ?? false,
        isEmployee: getBoolean(record, 'isEmployee') ?? false,
      };
    })
    .filter((item): item is KolamSourceUserRef => Boolean(item));
}

function normalizeCommissionMode(
  value: string,
): KolamSourceCommissionRecipientMode {
  switch (value) {
    case 'pic':
    case 'owner':
    case 'selected_users':
    case 'equal_all_employees':
      return value;
    default:
      return 'equal_all_employees';
  }
}

function formatUserLabel(value: unknown): string {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  const record = asRecord(value);
  const full = [
    getString(record, 'first_name') || getString(record, 'firstName'),
    getString(record, 'last_name') || getString(record, 'lastName'),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  return full || getString(record, 'username') || getString(record, 'email');
}

function formatIdr(amount: number) {
  return formatRupiah(amount);
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record && !Array.isArray(payload)) {
    return record.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === 1 || value === '1') {
    return true;
  }
  if (value === 'false' || value === 0 || value === '0') {
    return false;
  }
  return null;
}
