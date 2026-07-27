export interface KolamFreyerVariantOption {
  id: string;
  label: string;
  sku: string;
  stock: number;
  price: number;
}

export interface KolamFreyerOption {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  hasVariants: boolean;
  variants: KolamFreyerVariantOption[];
}

export function normalizeKolamFreyerOptionList(payload: unknown): KolamFreyerOption[] {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.items)
    ? rootRecord.items
    : [];

  return list
    .map(normalizeKolamFreyerOption)
    .filter(item => item.id && item.name);
}

function normalizeKolamFreyerOption(payload: unknown): KolamFreyerOption {
  const record = asRecord(payload);
  const variantConfig = asRecord(record.variantConfig);
  const variantsRaw = Array.isArray(record.variants) ? record.variants : [];
  const variants = variantsRaw
    .map(normalizeVariant)
    .filter(item => item.id);
  const hasVariants =
    Boolean(Object.keys(variantConfig).length && variants.length) ||
    variants.length > 0;

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    name: getString(record, 'name') || 'Freyer',
    sku:
      getString(record, 'sku') ||
      getString(record, 'productCode') ||
      '',
    stock:
      getNumber(record, 'stock') ??
      variants.reduce((sum, variant) => sum + variant.stock, 0),
    price:
      getNumber(record, 'price_to_sell') ??
      getNumber(record, 'priceToSell') ??
      getNumber(record, 'price') ??
      variants.find(variant => variant.price > 0)?.price ??
      0,
    hasVariants,
    variants,
  };
}

function normalizeVariant(payload: unknown): KolamFreyerVariantOption {
  const record = asRecord(payload);
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    label:
      getString(record, 'name') ||
      getString(record, 'label') ||
      getString(record, 'sku') ||
      'Varian',
    sku: getString(record, 'sku') || getString(record, 'productCode'),
    stock: getNumber(record, 'stock') ?? 0,
    price:
      getNumber(record, 'price_to_sell') ??
      getNumber(record, 'priceToSell') ??
      getNumber(record, 'price') ??
      0,
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
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
