import {
  KOLAM_DARA_TAX_SETTLEMENT_TYPE_LABEL,
  normalizeKolamDaraTaxSettlementList,
} from '../src/domain/kolam-dara-tax-settlement';

describe('kolam-dara-tax-settlement', () => {
  it('normalizes settlement list from API payload', () => {
    const rows = normalizeKolamDaraTaxSettlementList({
      data: [
        {
          _id: 's1',
          code: 'TAX-01-08-2026-123456',
          taxType: 'ppn',
          title: 'Setoran PPN',
          amount: 1_100_000,
          periodKey: '2026-05',
          status: 'unverified',
          executedAt: '2026-08-01T00:00:00.000Z',
        },
        {
          _id: 's2',
          code: 'TAX-02',
          taxType: 'pph21',
          title: 'PPh 21',
          amount: 50_000,
          status: 'verified',
          executedAt: '2026-07-15T00:00:00.000Z',
        },
      ],
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: 's1',
      code: 'TAX-01-08-2026-123456',
      taxType: 'ppn',
      title: 'Setoran PPN',
      amount: 1_100_000,
      periodKey: '2026-05',
      status: 'unverified',
    });
    expect(rows[1]?.status).toBe('verified');
    expect(KOLAM_DARA_TAX_SETTLEMENT_TYPE_LABEL.ppn).toBe('PPN');
  });

  it('skips rows without id', () => {
    expect(
      normalizeKolamDaraTaxSettlementList({
        data: [{title: 'no id', amount: 1}],
      }),
    ).toEqual([]);
  });
});
