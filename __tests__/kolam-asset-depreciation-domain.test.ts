import {
  buildKolamAssetCreateFromPurchasePayload,
  createEmptyKolamAssetDepreciationForm,
  formatDepreciationMethodLabel,
  getDecliningBalanceMonth1Preview,
  getStraightLineMonthlyPreview,
  normalizeKolamAssetDepreciationDetail,
  validateKolamAssetDepreciationForm,
} from '../src/domain/kolam-asset-depreciation';

describe('Kolam asset depreciation domain', () => {
  it('validates form and builds create payload from purchase', () => {
    const form = {
      ...createEmptyKolamAssetDepreciationForm(),
      salvageValueText: '1000000',
      usefulLifeText: '24',
      depreciationMethod: 'straight-line' as const,
    };
    expect(validateKolamAssetDepreciationForm(form, 10000000)).toBeNull();
    expect(getStraightLineMonthlyPreview(10000000, 1000000, 24)).toBe(375000);

    const payload = buildKolamAssetCreateFromPurchasePayload({
      purchaseId: 'ap-1',
      name: 'Laptop',
      photos: ['/uploads/a.jpg'],
      series: 'SN-1',
      purchasePrice: 10000000,
      executedAt: '2026-07-01T12:00:00.000Z',
      customFieldValues: [
        { label: 'RAM', value: '16GB' },
        { label: ' ', value: 'x' },
      ],
      form,
    });

    expect(payload).toMatchObject({
      name: 'Laptop',
      photo: '/uploads/a.jpg',
      series: 'SN-1',
      assetPurchase: 'ap-1',
      purchasePrice: 10000000,
      salvageValue: 1000000,
      usefulLife: 24,
      depreciationPeriod: 'monthly',
      depreciationMethod: 'straight-line',
      depreciationRate: null,
      customFieldValues: [{ label: 'RAM', value: '16GB' }],
    });
  });

  it('requires declining rate when salvage is zero', () => {
    const form = {
      ...createEmptyKolamAssetDepreciationForm(),
      salvageValueText: '0',
      usefulLifeText: '12',
      depreciationMethod: 'declining-balance' as const,
      depreciationRateText: '',
    };
    expect(validateKolamAssetDepreciationForm(form, 5000000)).toBe(
      'Tingkat penyusutan wajib diisi jika nilai residu 0',
    );
    expect(getDecliningBalanceMonth1Preview(1200000, 24)).toBe(24000);
  });

  it('normalizes asset detail with schedule and summary', () => {
    const detail = normalizeKolamAssetDepreciationDetail({
      data: {
        _id: 'asset-1',
        code: 'AST-1',
        name: 'Laptop',
        purchasePrice: 10000000,
        salvageValue: 1000000,
        usefulLife: 12,
        depreciationMethod: 'straight-line',
        purchaseDate: '2026-01-01T00:00:00.000Z',
        depreciation: {
          currentBookValue: 8500000,
          accumulated: 1500000,
          progressPercent: 16.7,
          isFullyDepreciated: false,
          completedPeriods: 2,
          depreciationPerPeriod: 750000,
        },
        depreciationSchedule: [
          {
            period: 1,
            depreciation: 750000,
            accumulated: 750000,
            bookValue: 9250000,
          },
          {
            period: 2,
            depreciation: 750000,
            accumulated: 1500000,
            bookValue: 8500000,
          },
          {
            period: 3,
            depreciation: 750000,
            accumulated: 2250000,
            bookValue: 7750000,
          },
        ],
      },
    });

    expect(formatDepreciationMethodLabel(detail.depreciationMethod)).toBe(
      'Garis Lurus',
    );
    expect(detail.depreciation?.completedPeriods).toBe(2);
    expect(detail.schedule[0]?.isDone).toBe(true);
    expect(detail.schedule[2]?.isDone).toBe(false);
  });
});
