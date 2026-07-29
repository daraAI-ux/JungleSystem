import { normalizeKolamPayableInstallmentList } from '../src/services/kolam-payable-installment-api';

describe('kolam payable installment normalization', () => {
  it('normalizes a plain array payload', () => {
    const result = normalizeKolamPayableInstallmentList([
      {
        _id: 'inst-1',
        installmentNumber: 1,
        amount: { $numberDecimal: '150000' },
        dueDate: '2026-02-01',
        status: 'pending',
        paidAt: '',
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'inst-1',
      installmentNumber: 1,
      amount: 150000,
      dueDate: '2026-02-01',
      status: 'pending',
      paidAt: '',
    });
  });

  it('normalizes a { data: [...] } wrapped payload', () => {
    const result = normalizeKolamPayableInstallmentList({
      data: [
        {
          id: 'inst-2',
          installmentNumber: 2,
          amount: 200000,
          dueDate: '2026-03-01',
          status: 'paid',
          paidAt: '2026-03-01T00:00:00.000Z',
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'inst-2',
      installmentNumber: 2,
      amount: 200000,
      status: 'paid',
      paidAt: '2026-03-01T00:00:00.000Z',
    });
  });

  it('normalizes a { installments: [...] } wrapped payload', () => {
    const result = normalizeKolamPayableInstallmentList({
      installments: [
        { _id: 'inst-3', installmentNumber: 3, amount: '75000', dueDate: '2026-04-01', status: 'overdue' },
      ],
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'inst-3',
      installmentNumber: 3,
      amount: 75000,
      status: 'overdue',
    });
  });

  it('normalizes a { data: { installments: [...] } } nested payload', () => {
    const result = normalizeKolamPayableInstallmentList({
      data: {
        installments: [
          { _id: 'inst-4', installmentNumber: 4, amount: 50000, dueDate: '2026-05-01' },
        ],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'inst-4',
      installmentNumber: 4,
      amount: 50000,
      status: 'pending',
    });
  });

  it('returns an empty array for unrecognized payload shapes', () => {
    expect(normalizeKolamPayableInstallmentList(null)).toEqual([]);
    expect(normalizeKolamPayableInstallmentList({})).toEqual([]);
    expect(normalizeKolamPayableInstallmentList(undefined)).toEqual([]);
  });
});
