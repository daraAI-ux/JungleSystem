export interface KolamWalletOption {
  id: string;
  name: string;
  type: string;
  /** Optional provider code (e.g. CASH) — used by cashflow deposit filters. */
  provider?: string;
  currentBalance: number;
}

export function normalizeKolamWalletOptionList(payload: unknown): KolamWalletOption[] {
  const root = unwrapData(payload);
  const rootRecord = asRecord(root);
  const list: unknown[] = Array.isArray(root)
    ? root
    : Array.isArray(rootRecord.data)
    ? rootRecord.data
    : Array.isArray(rootRecord.wallets)
    ? rootRecord.wallets
    : [];

  return list
    .map(normalizeKolamWalletOption)
    .filter(item => item.id && item.name);
}

function normalizeKolamWalletOption(payload: unknown): KolamWalletOption {
  const record = asRecord(payload);
  return {
    id: getString(record, '_id') || getString(record, 'id'),
    name: getString(record, 'name') || 'Dompet',
    type: getString(record, 'type') || 'regular',
    provider: getString(record, 'provider') || undefined,
    currentBalance:
      getNumber(record, 'currentBalance') ??
      getNumber(record, 'balance') ??
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
