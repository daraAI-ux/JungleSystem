export type KolamUnitType = 'weight' | 'volume' | 'length' | 'area' | 'other';
export type KolamUnitStatus = 'active' | 'inactive';

export interface KolamUnit {
  id: string;
  name: string;
  initial: string;
  type: KolamUnitType | null;
  category: string;
  isBase: boolean;
  status: KolamUnitStatus;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
}

export interface KolamUnitFormState {
  id?: string;
  name: string;
  initial: string;
}

export const KOLAM_UNIT_BREADCRUMB_ROOT = '/units';

export function isKolamUnitRoute(route: string) {
  return (
    route === KOLAM_UNIT_BREADCRUMB_ROOT ||
    route === `${KOLAM_UNIT_BREADCRUMB_ROOT}/create` ||
    route === `${KOLAM_UNIT_BREADCRUMB_ROOT}/baru` ||
    route.startsWith(`${KOLAM_UNIT_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamUnitBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  unit?: Pick<KolamUnit, 'name'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_UNIT_BREADCRUMB_ROOT}/baru`;
  }

  if ((mode === 'detail' || mode === 'edit') && unit) {
    return `${KOLAM_UNIT_BREADCRUMB_ROOT}/${unit.name}`;
  }

  return KOLAM_UNIT_BREADCRUMB_ROOT;
}

export function createEmptyKolamUnitFormState(): KolamUnitFormState {
  return {
    name: '',
    initial: '',
  };
}

export function createKolamUnitFormState(unit: KolamUnit): KolamUnitFormState {
  return {
    id: unit.id,
    name: unit.name,
    initial: unit.initial,
  };
}

export function createKolamUnitSavePayload(form: KolamUnitFormState) {
  return {
    name: form.name.trim(),
    initial: form.initial.trim(),
  };
}

export function normalizeKolamUnit(payload: unknown): KolamUnit {
  const record = asRecord(payload);
  const name = getString(record, 'name') || 'Satuan tanpa nama';
  const initial = getString(record, 'initial');
  const id = getString(record, '_id') || getString(record, 'id');

  return {
    id: id || slugifyUnitName(name),
    name,
    initial,
    type: normalizeUnitType(record.type),
    category: getString(record, 'category'),
    isBase: getBoolean(record, 'isBase') ?? false,
    status: record.status === 'inactive' ? 'inactive' : 'active',
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamUnitList(payload: unknown) {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : Array.isArray(rootRecord.units)
    ? rootRecord.units
    : [];

  return list.map(normalizeKolamUnit);
}

export function normalizeKolamUnitDetail(payload: unknown) {
  return normalizeKolamUnit(unwrapData(payload));
}

export function createKolamUnitListRevision(units: KolamUnit[]) {
  return createStableHash(
    units.map(unit => ({
      id: unit.id,
      name: unit.name,
      initial: unit.initial,
      type: unit.type,
      category: unit.category,
      isBase: unit.isBase,
      status: unit.status,
      updatedAt: unit.updatedAt,
    })),
  );
}

export function createKolamUnitDetailRevision(unit: KolamUnit) {
  return createStableHash({
    id: unit.id,
    name: unit.name,
    initial: unit.initial,
    type: unit.type,
    category: unit.category,
    isBase: unit.isBase,
    status: unit.status,
    createdAt: unit.createdAt,
    updatedAt: unit.updatedAt,
  });
}

export function slugifyUnitName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getUnitTypeLabel(type: KolamUnitType | null) {
  switch (type) {
    case 'weight':
      return 'Berat';
    case 'volume':
      return 'Volume';
    case 'length':
      return 'Panjang';
    case 'area':
      return 'Luas';
    case 'other':
      return 'Lainnya';
    default:
      return '-';
  }
}

function normalizeUnitType(value: unknown): KolamUnitType | null {
  if (
    value === 'weight' ||
    value === 'volume' ||
    value === 'length' ||
    value === 'area'
  ) {
    return value;
  }

  return typeof value === 'string' && value.trim() ? 'other' : null;
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
  return typeof value === 'string' ? value.trim() : '';
}

function getBoolean(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'boolean' ? value : null;
}

function createStableHash(value: unknown) {
  const json = JSON.stringify(value);
  let hash = 0;
  for (let index = 0; index < json.length; index += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}
