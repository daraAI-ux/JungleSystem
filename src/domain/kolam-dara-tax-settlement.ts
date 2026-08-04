/** FE `tax-settlement-api` + BE `/tax-settlement`. */

export type KolamDaraTaxSettlementType =
  | 'ppn'
  | 'pph21'
  | 'pph23'
  | 'pph_final'
  | 'other';

export type KolamDaraTaxSettlementStatus = 'unverified' | 'verified';

export type KolamDaraTaxSettlement = {
  id: string;
  code: string;
  taxType: KolamDaraTaxSettlementType;
  title: string;
  amount: number;
  periodKey: string;
  note: string;
  status: KolamDaraTaxSettlementStatus;
  executedAt: string;
};

export const KOLAM_DARA_TAX_SETTLEMENT_TYPES: Array<{
  id: KolamDaraTaxSettlementType;
  label: string;
}> = [
  {id: 'ppn', label: 'PPN'},
  {id: 'pph21', label: 'PPh 21'},
  {id: 'pph23', label: 'PPh 23'},
  {id: 'pph_final', label: 'PPh Final'},
  {id: 'other', label: 'Lainnya'},
];

export const KOLAM_DARA_TAX_SETTLEMENT_TYPE_LABEL: Record<string, string> = {
  ppn: 'PPN',
  pph21: 'PPh 21',
  pph23: 'PPh 23',
  pph_final: 'PPh Final',
  other: 'Lainnya',
};

export function normalizeKolamDaraTaxSettlementList(
  payload: unknown,
): KolamDaraTaxSettlement[] {
  const root = asRecord(payload);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
      ? root.data
      : [];
  return list
    .map(normalizeKolamDaraTaxSettlement)
    .filter((row): row is KolamDaraTaxSettlement => row != null);
}

export function normalizeKolamDaraTaxSettlement(
  payload: unknown,
): KolamDaraTaxSettlement | null {
  const row = asRecord(payload);
  const id = String(row._id || row.id || '').trim();
  if (!id) {
    return null;
  }
  const taxTypeRaw = String(row.taxType || '').trim();
  const taxType = isSettlementType(taxTypeRaw) ? taxTypeRaw : 'other';
  const statusRaw = String(row.status || '').trim();
  const status: KolamDaraTaxSettlementStatus =
    statusRaw === 'verified' ? 'verified' : 'unverified';
  return {
    id,
    code: String(row.code || '').trim(),
    taxType,
    title: String(row.title || '').trim() || id,
    amount: asNumber(row.amount),
    periodKey: String(row.periodKey || '').trim(),
    note: String(row.note || '').trim(),
    status,
    executedAt: String(row.executedAt || row.createdAt || '').trim(),
  };
}

function isSettlementType(value: string): value is KolamDaraTaxSettlementType {
  return (
    value === 'ppn' ||
    value === 'pph21' ||
    value === 'pph23' ||
    value === 'pph_final' ||
    value === 'other'
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
