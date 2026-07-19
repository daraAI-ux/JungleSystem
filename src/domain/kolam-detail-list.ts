export interface KolamDetailListItem {
  badge?: string;
  meta?: string;
  title: string;
  value?: string;
}

export function getKolamRawArray(raw: unknown, key: string) {
  const record = asDetailRecord(raw);
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

export function createKolamDetailItemsFromRawArray(items: unknown[]) {
  return items.map((item, index) => {
    const record = asDetailRecord(item);
    return {
      badge: getDetailBadge(record),
      meta: getDetailMeta(record),
      title: getDetailTitle(record) || `Item ${index + 1}`,
      value: getDetailValue(record),
    };
  });
}

function getDetailTitle(record: Record<string, unknown>) {
  return (
    getDetailString(record, 'name') ||
    getDetailString(record, 'title') ||
    getDetailString(record, 'commonName') ||
    getDetailString(record, 'scientificName') ||
    getDetailString(record, 'localName') ||
    getDetailString(record, 'sku') ||
    getDetailString(record, 'code')
  );
}

function getDetailMeta(record: Record<string, unknown>) {
  const parts = [
    getDetailString(record, 'sku') || getDetailString(record, 'productCode'),
    getNestedDetailName(record.category) ||
      getNestedDetailName(record.parent) ||
      getDetailString(record, 'type'),
    stripHtmlText(getDetailString(record, 'description')),
  ].filter(Boolean);

  return parts.slice(0, 2).join(' - ');
}

function getDetailValue(record: Record<string, unknown>) {
  const price =
    getDetailNumber(record, 'price') ??
    getDetailNumber(record, 'sellingPrice') ??
    getDetailNumber(record, 'salePrice') ??
    getDetailNumber(record, 'purchasePrice');

  if (typeof price === 'number') {
    return formatDetailMoney(price);
  }

  return getDetailString(record, 'unit') || undefined;
}

function getDetailBadge(record: Record<string, unknown>) {
  const stock =
    getDetailNumber(record, 'stock') ??
    getDetailNumber(record, 'quantity') ??
    getDetailNumber(record, 'qty');

  if (typeof stock === 'number') {
    return `Stok ${stock}`;
  }

  return getDetailString(record, 'status') || undefined;
}

function getNestedDetailName(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  return getDetailTitle(asDetailRecord(value));
}

function getDetailString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function getDetailNumber(record: Record<string, unknown>, key: string) {
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

function asDetailRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function formatDetailMoney(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

function stripHtmlText(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
