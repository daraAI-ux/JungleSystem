export interface KolamProductOption {
  id: string;
  name: string;
  sku: string;
  type: string;
  price: number;
  stock: number;
  raw: unknown;
}

export function normalizeKolamProductOptionList(payload: unknown): KolamProductOption[] {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.products)
    ? rootRecord.products
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : [];

  return list.map(normalizeKolamProductOption).filter(item => item.id && item.name);
}

export function createKolamProductOptionListRevision(items: KolamProductOption[]) {
  return createStableHash(
    items.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      type: item.type,
      price: item.price,
      stock: item.stock,
    })),
  );
}

function normalizeKolamProductOption(payload: unknown): KolamProductOption {
  const record = asRecord(payload);
  const id = getString(record, '_id') || getString(record, 'id');
  const name =
    getString(record, 'name') ||
    getString(record, 'commonName') ||
    getString(record, 'scientificName') ||
    getString(record, 'sku') ||
    'Produk tanpa nama';

  return {
    id,
    name,
    sku: getString(record, 'sku'),
    type: getString(record, 'type'),
    price:
      getNumber(record, 'price') ??
      getNumber(record, 'priceToSell') ??
      getNumber(record, 'sellingPrice') ??
      0,
    stock:
      getNumber(record, 'stock') ??
      getNumber(record, 'currentStock') ??
      getNumber(record, 'totalStock') ??
      0,
    raw: payload,
  };
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

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
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