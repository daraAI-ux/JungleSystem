export type KolamBiteshipServiceOption = {
  code: string;
  name: string;
  description: string;
};

export type KolamBiteshipCourierOption = {
  code: string;
  name: string;
  category: 'instant' | 'regular';
  services: KolamBiteshipServiceOption[];
};

export type KolamShippingCourierCatalogItem = {
  id: string;
  provider: 'biteship';
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  description: string;
  category: 'instant' | 'regular';
  serviceType: string;
  shippingType: string;
  source: string;
  isActive: boolean;
  syncedAt?: string;
  updatedAt?: string;
  raw: unknown;
};

export type KolamShippingCourierCatalogStats = {
  couriers: number;
  services: number;
  active: number;
  inactive: number;
};

export const BITESHIP_COURIERS: KolamBiteshipCourierOption[] = [
  {
    code: 'jne',
    name: 'JNE',
    category: 'regular',
    services: [
      { code: 'reg', name: 'REG', description: 'Regular service' },
      { code: 'yes', name: 'YES', description: 'Express next-day service' },
      { code: 'oke', name: 'OKE', description: 'Economy service' },
      { code: 'jtr', name: 'JTR', description: 'Cargo trucking service' },
      {
        code: 'jtr_150_250',
        name: 'JTR 150 250',
        description: 'Cargo trucking 150cc to 250cc',
      },
      {
        code: 'jtr_150',
        name: 'JTR 150',
        description: 'Cargo trucking below 150cc',
      },
      {
        code: 'jtr_250',
        name: 'JTR 250',
        description: 'Cargo trucking above 250cc',
      },
    ],
  },
  {
    code: 'jnt',
    name: 'J&T',
    category: 'regular',
    services: [
      { code: 'ez', name: 'EZ', description: 'Regular service' },
      { code: 'eco', name: 'ECO', description: 'Economy service' },
      { code: 'same_day', name: 'Same Day', description: 'Same-day service' },
    ],
  },
  {
    code: 'sicepat',
    name: 'SiCepat',
    category: 'regular',
    services: [
      { code: 'reg', name: 'Regular', description: 'Regular service' },
      { code: 'best', name: 'BEST', description: 'Express service' },
      { code: 'halu', name: 'HALU', description: 'Economy service' },
      { code: 'gokil', name: 'GOKIL', description: 'Cargo service' },
    ],
  },
  {
    code: 'tiki',
    name: 'TIKI',
    category: 'regular',
    services: [
      { code: 'reg', name: 'REG', description: 'Regular service' },
      { code: 'ons', name: 'ONS', description: 'Over night service' },
      { code: 'eko', name: 'EKO', description: 'Economy service' },
      { code: 'sds', name: 'SDS', description: 'Same-day service' },
      {
        code: 't15',
        name: 'T15',
        description: 'Motorcycle cargo below 150cc',
      },
    ],
  },
  {
    code: 'lion',
    name: 'Lion Parcel',
    category: 'regular',
    services: [
      { code: 'regpack', name: 'REGPACK', description: 'Regular package' },
      { code: 'onepack', name: 'ONEPACK', description: 'Express package' },
      { code: 'jagopack', name: 'JAGOPACK', description: 'Economy package' },
    ],
  },
  {
    code: 'anteraja',
    name: 'Anteraja',
    category: 'regular',
    services: [
      { code: 'reg', name: 'Regular', description: 'Regular service' },
      { code: 'next', name: 'Next Day', description: 'Next-day service' },
      { code: 'same', name: 'Same Day', description: 'Same-day service' },
    ],
  },
  {
    code: 'paxel',
    name: 'Paxel',
    category: 'regular',
    services: [
      {
        code: 'small',
        name: 'Small Package',
        description: 'Small package service',
      },
      {
        code: 'medium',
        name: 'Medium Package',
        description: 'Medium package service',
      },
      {
        code: 'large',
        name: 'Large Package',
        description: 'Large package service',
      },
      {
        code: 'paxel_big',
        name: 'Paxel Big',
        description: 'Large cargo package service',
      },
    ],
  },
  {
    code: 'lalamove',
    name: 'Lalamove',
    category: 'instant',
    services: [
      {
        code: 'motorcycle',
        name: 'Motorcycle',
        description: 'Delivery using bike',
      },
      { code: 'mpv', name: 'MPV', description: 'Delivery using car' },
      { code: 'van', name: 'Van', description: 'Delivery using van' },
      { code: 'truck', name: 'Truck', description: 'Delivery using truck' },
      {
        code: 'cdd_bak',
        name: 'CDD Bak',
        description: 'Delivery using CDD Bak',
      },
      {
        code: 'cdd_box',
        name: 'CDD Box',
        description: 'Delivery using CDD Box',
      },
      {
        code: 'engkel_bak',
        name: 'Engkel Bak',
        description: 'Delivery using Engkel Bak',
      },
      {
        code: 'engkel_box',
        name: 'Engkel Box',
        description: 'Delivery using Engkel Box',
      },
    ],
  },
  {
    code: 'grab',
    name: 'Grab',
    category: 'instant',
    services: [
      { code: 'instant', name: 'Instant', description: 'Instant courier' },
      { code: 'same_day', name: 'Same Day', description: 'Same-day courier' },
      {
        code: 'instant_car',
        name: 'Instant Car',
        description: 'Instant car courier',
      },
    ],
  },
  {
    code: 'gojek',
    name: 'Gojek',
    category: 'instant',
    services: [
      { code: 'instant', name: 'Instant', description: 'Instant courier' },
      { code: 'same_day', name: 'Same Day', description: 'Same-day courier' },
    ],
  },
];

export function normalizeKolamShippingCourierCatalogList(
  payload: unknown,
): KolamShippingCourierCatalogItem[] {
  return extractCatalogArray(payload)
    .map(normalizeKolamShippingCourierCatalogItem)
    .filter(item => item.id && item.courierCode && item.serviceCode);
}

export function normalizeKolamShippingCourierCatalogItem(
  payload: unknown,
): KolamShippingCourierCatalogItem {
  const record = asRecord(unwrapData(payload));
  const id =
    getObjectIdString(record) || getString(record, '_id') || getString(record, 'id');
  const categoryRaw = getString(record, 'category');
  const category: 'instant' | 'regular' =
    categoryRaw === 'instant' ? 'instant' : 'regular';

  return {
    id,
    provider: 'biteship',
    courierCode: getString(record, 'courierCode'),
    courierName: getString(record, 'courierName'),
    serviceCode: getString(record, 'serviceCode'),
    serviceName: getString(record, 'serviceName'),
    description: getString(record, 'description'),
    category,
    serviceType: getString(record, 'serviceType'),
    shippingType: getString(record, 'shippingType'),
    source: getString(record, 'source'),
    isActive: getBoolean(record, 'isActive') ?? true,
    syncedAt: getString(record, 'syncedAt') || undefined,
    updatedAt: getString(record, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function buildBiteshipCouriersFromCatalog(
  rows: KolamShippingCourierCatalogItem[] = [],
): KolamBiteshipCourierOption[] {
  const grouped = new Map<string, KolamBiteshipCourierOption>();

  rows
    .filter(row => row.isActive)
    .forEach(row => {
      if (!grouped.has(row.courierCode)) {
        grouped.set(row.courierCode, {
          code: row.courierCode,
          name: row.courierName,
          category: row.category,
          services: [],
        });
      }

      grouped.get(row.courierCode)?.services.push({
        code: row.serviceCode,
        name: row.serviceName,
        description: row.description || '',
      });
    });

  return Array.from(grouped.values())
    .map(courier => ({
      ...courier,
      services: courier.services.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findCourier(
  code?: string | null,
  couriers: KolamBiteshipCourierOption[] = BITESHIP_COURIERS,
) {
  return couriers.find(courier => courier.code === code);
}

export function findService(
  courierCode?: string | null,
  serviceCode?: string | null,
  couriers: KolamBiteshipCourierOption[] = BITESHIP_COURIERS,
) {
  return findCourier(courierCode, couriers)?.services.find(
    service => service.code === serviceCode,
  );
}

export function buildMethodName(
  courierName?: string | null,
  serviceName?: string | null,
) {
  const courier = courierName?.trim();
  const service = serviceName?.trim();
  if (courier && service) {
    return `${courier} - ${service}`;
  }
  return courier || service || '';
}

export function getKolamShippingCourierCatalogStats(
  rows: KolamShippingCourierCatalogItem[],
): KolamShippingCourierCatalogStats {
  const couriers = new Set(rows.map(row => row.courierCode));
  const active = rows.filter(row => row.isActive).length;
  return {
    couriers: couriers.size,
    services: rows.length,
    active,
    inactive: rows.length - active,
  };
}

function extractCatalogArray(payload: unknown): unknown[] {
  const root = unwrapData(payload);
  const record = asRecord(root);
  if (Array.isArray(root)) {
    return root;
  }
  if (Array.isArray(record.data)) {
    return record.data;
  }
  if (Array.isArray(record.items)) {
    return record.items;
  }
  const nested = asRecord(record.data);
  if (Array.isArray(nested.data)) {
    return nested.data;
  }
  return [];
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record && !Array.isArray(payload)) {
    return record.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
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

function getObjectIdString(record: Record<string, unknown>) {
  const value = record._id;
  if (typeof value === 'string') {
    return value;
  }
  const objectRecord = asRecord(value);
  return getString(objectRecord, '$oid');
}
