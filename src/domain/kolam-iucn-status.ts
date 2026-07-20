import { getKolamFileUrl } from '../lib/file-url';

export type KolamIucnStatusState = 'active' | 'inactive';

export interface KolamIucnSpeciesUsageItem {
  id: string;
  scientificName: string;
  commonName: string;
  sku: string;
  slug: string;
  photoUri: string | null;
  raw: unknown;
}

export interface KolamIucnStatus {
  id: string;
  name: string;
  abbreviation: string;
  image: string | null;
  imageUri: string | null;
  order: number;
  status: KolamIucnStatusState;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  species: KolamIucnSpeciesUsageItem[];
  raw: unknown;
}

export interface KolamIucnStatusFormState {
  id?: string;
  name: string;
  abbreviation: string;
  imageLocalUri: string;
  status: KolamIucnStatusState;
}

export const KOLAM_IUCN_BREADCRUMB_ROOT = '/iucn-status';

export function isKolamIucnStatusRoute(route: string) {
  return (
    route === KOLAM_IUCN_BREADCRUMB_ROOT ||
    route === `${KOLAM_IUCN_BREADCRUMB_ROOT}/create` ||
    route === `${KOLAM_IUCN_BREADCRUMB_ROOT}/baru` ||
    route.startsWith(`${KOLAM_IUCN_BREADCRUMB_ROOT}/`)
  );
}

export function getKolamIucnStatusBreadcrumbPath(
  mode: 'list' | 'detail' | 'edit' | 'new',
  item?: Pick<KolamIucnStatus, 'name'> | null,
) {
  if (mode === 'new') {
    return `${KOLAM_IUCN_BREADCRUMB_ROOT}/baru`;
  }

  if ((mode === 'detail' || mode === 'edit') && item) {
    return `${KOLAM_IUCN_BREADCRUMB_ROOT}/${item.name}`;
  }

  return KOLAM_IUCN_BREADCRUMB_ROOT;
}

export function createEmptyKolamIucnStatusFormState(): KolamIucnStatusFormState {
  return {
    name: '',
    abbreviation: '',
    imageLocalUri: '',
    status: 'active',
  };
}

export function createKolamIucnStatusFormState(
  item: KolamIucnStatus,
): KolamIucnStatusFormState {
  return {
    id: item.id,
    name: item.name,
    abbreviation: item.abbreviation,
    imageLocalUri: '',
    status: item.status,
  };
}

export function createKolamIucnStatusSavePayload(
  form: KolamIucnStatusFormState,
) {
  return {
    name: form.name.trim(),
    abbreviation: form.abbreviation.trim().toUpperCase(),
    status: form.status,
  };
}

export function normalizeKolamIucnStatus(payload: unknown): KolamIucnStatus {
  const record = asRecord(unwrapData(payload));
  const name = getString(record, 'name') || 'Status IUCN tanpa nama';
  const abbreviation = getString(record, 'abbreviation').toUpperCase();
  const id = getString(record, '_id') || getString(record, 'id');
  const image = getNullableString(record, 'image');
  const createdBy = asRecord(record.createdBy);

  return {
    id: id || slugifyIucnStatusName(abbreviation || name),
    name,
    abbreviation,
    image,
    imageUri: getKolamFileUrl(image),
    order: getNumber(record, 'order') ?? 0,
    status: record.status === 'inactive' ? 'inactive' : 'active',
    createdBy:
      getString(createdBy, 'username') ||
      getString(createdBy, 'name') ||
      getString(record, 'createdBy'),
    createdAt: getString(record, 'createdAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    species: normalizeSpeciesUsageList(record.species),
    raw: payload,
  };
}

export function normalizeKolamIucnStatusList(payload: unknown) {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : Array.isArray(rootRecord.iucnStatuses)
    ? rootRecord.iucnStatuses
    : [];

  return list.map(normalizeKolamIucnStatus);
}

export function normalizeKolamIucnStatusDetail(payload: unknown) {
  return normalizeKolamIucnStatus(payload);
}

export function createKolamIucnStatusListRevision(items: KolamIucnStatus[]) {
  return createStableHash(
    items.map(item => ({
      id: item.id,
      name: item.name,
      abbreviation: item.abbreviation,
      image: item.image,
      order: item.order,
      status: item.status,
      updatedAt: item.updatedAt,
    })),
  );
}

export function createKolamIucnStatusDetailRevision(item: KolamIucnStatus) {
  return createStableHash({
    id: item.id,
    name: item.name,
    abbreviation: item.abbreviation,
    image: item.image,
    order: item.order,
    status: item.status,
    species: item.species.map(species => species.id),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });
}

export function slugifyIucnStatusName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getIucnStatusLabel(status: KolamIucnStatusState) {
  return status === 'inactive' ? 'Nonaktif' : 'Aktif';
}

export function getIucnConservationInfo(abbreviation: string) {
  switch (abbreviation.trim().toUpperCase()) {
    case 'NE':
      return {
        color: '#9ca3af',
        label: 'Belum Dievaluasi',
        description: 'Spesies yang belum dinilai berdasarkan kriteria IUCN.',
      };
    case 'DD':
      return {
        color: '#6b7280',
        label: 'Data Kurang',
        description: 'Informasi yang tersedia belum cukup untuk penilaian konservasi.',
      };
    case 'LC':
      return {
        color: '#10b981',
        label: 'Risiko Rendah',
        description: 'Spesies dengan risiko kepunahan rendah.',
      };
    case 'NT':
      return {
        color: '#84cc16',
        label: 'Hampir Terancam',
        description: 'Spesies yang hampir memenuhi kategori terancam.',
      };
    case 'VU':
      return {
        color: '#f59e0b',
        label: 'Rentan',
        description: 'Spesies dengan risiko kepunahan tinggi di alam liar.',
      };
    case 'EN':
      return {
        color: '#f97316',
        label: 'Terancam',
        description: 'Spesies dengan risiko kepunahan sangat tinggi.',
      };
    case 'CR':
      return {
        color: '#ef4444',
        label: 'Sangat Terancam',
        description: 'Spesies dengan risiko kepunahan sangat tinggi dan butuh tindakan segera.',
      };
    case 'EW':
      return {
        color: '#9333ea',
        label: 'Punah di Alam Liar',
        description: 'Spesies hanya bertahan di luar habitat alaminya.',
      };
    case 'EX':
      return {
        color: '#44403c',
        label: 'Punah',
        description: 'Tidak ada individu hidup yang diketahui.',
      };
    default:
      return {
        color: '#10b981',
        label: 'Status IUCN',
        description: '',
      };
  }
}

function normalizeSpeciesUsageList(value: unknown): KolamIucnSpeciesUsageItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(item => {
    const record = asRecord(item);
    const id = getString(record, '_id') || getString(record, 'id');
    const thumbnail = getNullableString(record, 'thumbnailImage');
    const photos = Array.isArray(record.photos)
      ? record.photos.map(photo => String(photo).trim()).filter(Boolean)
      : [];

    return {
      id,
      scientificName: getString(record, 'scientificName'),
      commonName: getString(record, 'commonName'),
      sku: getString(record, 'sku'),
      slug: getString(record, 'slug'),
      photoUri: getKolamFileUrl(thumbnail ?? photos[0]),
      raw: item,
    };
  });
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

function getNullableString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
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

function createStableHash(value: unknown) {
  const json = JSON.stringify(value);
  let hash = 0;
  for (let index = 0; index < json.length; index += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}
