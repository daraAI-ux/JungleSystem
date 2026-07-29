import { getKolamFileUrl } from '../lib/file-url';

export type KolamVendorStatus = 'active' | 'inactive' | 'blacklisted';

export interface KolamVendorBrandRef {
  id: string;
  name: string;
}

export interface KolamVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: KolamVendorStatus | string;
  isOfficialDistributor: boolean;
  description: string;
  address: string;
  province: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  bankName: string;
  bankAccountNumber: string;
  links: string[];
  photos: string[];
  photoUrls: string[];
  brands: KolamVendorBrandRef[];
  warrantyContactNote: string;
  poCount: number;
  productCount: number;
  speciesCount: number;
  packingCount: number;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
}

export const KOLAM_SUPPLIER_ROOT = '/suppliers';

export function isKolamSupplierRoute(route: string) {
  const path = normalizeSupplierRoutePath(route);
  return (
    path === KOLAM_SUPPLIER_ROOT ||
    path.startsWith(`${KOLAM_SUPPLIER_ROOT}/`)
  );
}

export function isKolamSupplierListRoute(route: string) {
  return normalizeSupplierRoutePath(route) === KOLAM_SUPPLIER_ROOT;
}

export function getKolamSupplierRouteId(route: string) {
  const path = normalizeSupplierRoutePath(route);
  if (
    path === KOLAM_SUPPLIER_ROOT ||
    path.endsWith('/create') ||
    path.endsWith('/edit')
  ) {
    return null;
  }
  const match = /^\/suppliers\/([^/]+)$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function getKolamSupplierEditRouteId(route: string) {
  const path = normalizeSupplierRoutePath(route);
  const match = /^\/suppliers\/([^/]+)\/edit$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function isKolamSupplierCreateRoute(route: string) {
  const path = normalizeSupplierRoutePath(route);
  return path === `${KOLAM_SUPPLIER_ROOT}/create`;
}

export function getKolamSupplierBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  vendor?: Pick<KolamVendor, 'name' | 'id'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_SUPPLIER_ROOT}/create`;
  }
  if ((mode === 'detail' || mode === 'edit') && vendor?.id) {
    return mode === 'edit'
      ? `${KOLAM_SUPPLIER_ROOT}/${vendor.id}/edit`
      : `${KOLAM_SUPPLIER_ROOT}/${vendor.id}`;
  }
  return KOLAM_SUPPLIER_ROOT;
}

export interface KolamVendorFormState {
  id?: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  bankName: string;
  bankAccountNumber: string;
  status: KolamVendorStatus;
  isOfficialDistributor: boolean;
  warrantyContactNote: string;
  brandIds: string[];
  linkText: string;
}

export function createEmptyKolamVendorFormState(): KolamVendorFormState {
  return {
    name: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    province: '',
    city: '',
    state: '',
    country: 'Indonesia',
    postalCode: '',
    bankName: '',
    bankAccountNumber: '',
    status: 'active',
    isOfficialDistributor: false,
    warrantyContactNote: '',
    brandIds: [],
    linkText: '',
  };
}

export function createKolamVendorFormState(
  vendor: KolamVendor,
): KolamVendorFormState {
  return {
    id: vendor.id,
    name: vendor.name,
    description: vendor.description,
    email: vendor.email === '-' ? '' : vendor.email,
    phone: vendor.phone === '-' ? '' : vendor.phone,
    address: vendor.address,
    province: vendor.province,
    city: vendor.city,
    state: vendor.state,
    country: vendor.country || 'Indonesia',
    postalCode: vendor.postalCode,
    bankName: vendor.bankName,
    bankAccountNumber:
      vendor.bankAccountNumber === '-' ? '' : vendor.bankAccountNumber,
    status: coerceVendorStatus(String(vendor.status)),
    isOfficialDistributor: vendor.isOfficialDistributor,
    warrantyContactNote: vendor.warrantyContactNote,
    brandIds: vendor.brands.map(brand => brand.id).filter(Boolean),
    linkText: vendor.links.join('\n'),
  };
}

export function createKolamVendorSavePayload(form: KolamVendorFormState) {
  const links = form.linkText
    .split(/\r?\n/)
    .map(link => link.trim())
    .filter(Boolean);

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    brands: form.brandIds,
    email: form.email.trim() || '-',
    phone: form.phone.trim() || '-',
    address: form.address.trim(),
    province: form.province.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim() || 'Indonesia',
    postalCode: form.postalCode.trim(),
    bankName: form.bankName.trim(),
    bankAccountNumber: form.bankAccountNumber.trim() || '-',
    status: form.status,
    isOfficialDistributor: form.isOfficialDistributor,
    warrantyContactNote: form.warrantyContactNote.trim(),
    link: links,
  };
}

export function normalizeKolamVendorList(payload: unknown): KolamVendor[] {
  const root = asRecord(payload);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.vendors)
    ? root.vendors
    : [];

  return list
    .map(normalizeKolamVendor)
    .filter(vendor => vendor.id && vendor.name);
}

export function normalizeKolamVendorDetail(payload: unknown): KolamVendor {
  const root = asRecord(payload);
  const record = Object.keys(asRecord(root.data)).length
    ? asRecord(root.data)
    : root;
  return normalizeKolamVendor(record);
}

export function normalizeKolamVendor(value: unknown): KolamVendor {
  const record = asRecord(value);
  const photos = normalizeStringArray(record.photos);
  const brands = normalizeBrandRefs(record.brands);
  const createdBy = asRecord(record.createdBy);

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    name:
      getString(record, 'name') ||
      getString(record, 'companyName') ||
      getString(record, 'displayName') ||
      'Vendor tanpa nama',
    email: getString(record, 'email'),
    phone: getString(record, 'phone') || getString(record, 'phoneNumber'),
    status: normalizeVendorStatus(getString(record, 'status')),
    isOfficialDistributor: getBoolean(record, 'isOfficialDistributor'),
    description: getString(record, 'description'),
    address: getString(record, 'address'),
    province: getString(record, 'province'),
    city: getString(record, 'city'),
    state: getString(record, 'state'),
    country: getString(record, 'country'),
    postalCode: getString(record, 'postalCode'),
    bankName: getString(record, 'bankName'),
    bankAccountNumber: getString(record, 'bankAccountNumber'),
    links: normalizeStringArray(record.link),
    photos,
    photoUrls: photos
      .map(photo => getKolamFileUrl(photo) ?? photo)
      .filter(Boolean),
    brands,
    warrantyContactNote: getString(record, 'warrantyContactNote'),
    poCount: getNumber(record, 'poCount') ?? 0,
    productCount: getNumber(record, 'productCount') ?? 0,
    speciesCount: getNumber(record, 'speciesCount') ?? 0,
    packingCount: getNumber(record, 'packingCount') ?? 0,
    createdAt: getString(record, 'createdAt'),
    updatedAt: getString(record, 'updatedAt'),
    createdByName: resolvePersonName(createdBy),
  };
}

export function createKolamVendorListRevision(vendors: KolamVendor[]) {
  return JSON.stringify(
    vendors.map(vendor => ({
      id: vendor.id,
      isOfficialDistributor: vendor.isOfficialDistributor,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      status: vendor.status,
      poCount: vendor.poCount,
      productCount: vendor.productCount,
      updatedAt: vendor.updatedAt,
    })),
  );
}

export function getKolamVendorStatusLabel(status?: string) {
  switch (normalizeVendorStatus(status || '')) {
    case 'active':
      return 'Aktif';
    case 'inactive':
      return 'Nonaktif';
    case 'blacklisted':
      return 'Diblacklist';
    default:
      return status?.trim() || '—';
  }
}

export function getKolamVendorStatusIntent(
  status?: string,
): 'success' | 'warning' | 'danger' | 'muted' {
  switch (normalizeVendorStatus(status || '')) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'blacklisted':
      return 'danger';
    default:
      return 'muted';
  }
}

export function formatKolamVendorAddress(vendor: KolamVendor) {
  return [
    vendor.address,
    vendor.city,
    vendor.province,
    vendor.state,
    vendor.country,
    vendor.postalCode,
  ]
    .map(part => part.trim())
    .filter(Boolean)
    .join(', ');
}

function normalizeVendorStatus(value: string): KolamVendorStatus | string {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'active' ||
    normalized === 'inactive' ||
    normalized === 'blacklisted'
  ) {
    return normalized;
  }
  return value.trim() || 'active';
}

function coerceVendorStatus(value: string): KolamVendorStatus {
  const normalized = normalizeVendorStatus(value);
  return normalized === 'inactive' || normalized === 'blacklisted'
    ? normalized
    : 'active';
}

function normalizeBrandRefs(value: unknown): KolamVendorBrandRef[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      if (typeof item === 'string') {
        return { id: item, name: item };
      }
      const record = asRecord(item);
      const id = getString(record, '_id') || getString(record, 'id');
      const name = getString(record, 'name') || id;
      if (!id && !name) {
        return null;
      }
      return { id: id || name, name: name || id };
    })
    .filter((item): item is KolamVendorBrandRef => Boolean(item));
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

function resolvePersonName(record: Record<string, unknown>) {
  const fullName = [
    getString(record, 'first_name'),
    getString(record, 'last_name'),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  return (
    fullName ||
    getString(record, 'name') ||
    getString(record, 'displayName') ||
    getString(record, 'username') ||
    getString(record, 'email')
  );
}

function normalizeSupplierRoutePath(route: string) {
  const path = route.trim().split('?')[0] || '';
  if (!path) {
    return '';
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getBoolean(record: Record<string, unknown>, key: string) {
  return record[key] === true;
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
