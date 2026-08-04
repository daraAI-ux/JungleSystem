import {
  formatKolamDaraMarketPlatformFeeCheckNotice,
  normalizeKolamDaraMarketPlatformFeeCalculation,
  normalizeKolamDaraMarketPlatformFeeCheckResult,
  normalizeKolamDaraMarketPlatformFeeMeta,
  normalizeKolamDaraMarketPlatformFeeProfiles,
  normalizeKolamDaraMarketPlatformFeeSources,
  normalizeKolamDaraMarketPlatformFeeSnapshots,
} from '../src/domain/kolam-dara-market-platform-fee';

describe('kolam-dara-market-platform-fee domain', () => {
  it('normalizes meta, profiles, sources, and snapshots', () => {
    const meta = normalizeKolamDaraMarketPlatformFeeMeta({
      data: {
        sellerTiers: [{id: 'star', label: 'Star'}],
        programs: {shopee: [{id: 'promoXtra', label: 'Promo'}]},
        categories: {shopee: [{id: 'cat1', label: 'Elektronik'}]},
      },
    });
    expect(meta.sellerTiers[0].label).toBe('Star');
    expect(meta.programs.shopee[0].id).toBe('promoXtra');

    const profiles = normalizeKolamDaraMarketPlatformFeeProfiles({
      data: [
        {
          _id: 'p1',
          platform: 'shopee',
          sellerTier: 'star',
          programs: {promoXtra: true},
          primaryCategoryId: 'cat1',
          primaryCategoryLabel: 'Elektronik',
        },
      ],
    });
    expect(profiles[0]).toMatchObject({
      platform: 'shopee',
      sellerTier: 'star',
      programs: {promoXtra: true},
    });

    const sources = normalizeKolamDaraMarketPlatformFeeSources({
      data: [
        {
          _id: 's1',
          name: 'Fee Shopee',
          url: 'https://seller.shopee.test',
          platform: 'shopee',
          isActive: true,
        },
      ],
    });
    expect(sources[0].id).toBe('s1');

    const snaps = normalizeKolamDaraMarketPlatformFeeSnapshots({
      data: [
        {
          _id: 'snap1',
          platform: 'shopee',
          status: 'pending',
          mappedFees: [{name: 'Biaya layanan', type: 'percentage', value: 2}],
          sourceId: {name: 'Fee Shopee', url: 'https://x'},
          createdAt: '2026-01-01',
        },
      ],
    });
    expect(snaps[0].mappedFees[0].value).toBe(2);
  });

  it('formats check notice and calculation sample rows', () => {
    expect(
      formatKolamDaraMarketPlatformFeeCheckNotice(
        {changed: true, error: '', aiPending: false, reason: ''},
        'Fee Shopee',
      ),
    ).toContain('perubahan terdeteksi');

    expect(
      normalizeKolamDaraMarketPlatformFeeCheckResult({
        data: {changed: false, aiPending: true},
      }).aiPending,
    ).toBe(true);

    const calc = normalizeKolamDaraMarketPlatformFeeCalculation({
      data: {
        platforms: [
          {
            platform: 'tokopedia',
            profileSummary: {tier: 'Official', category: 'Fashion'},
            activeLines: [
              {
                code: 'svc',
                name: 'Biaya layanan',
                rateDisplay: '2%',
                basisFormula: 'subtotal',
                snapshotStatus: 'approved',
                sourceName: 'Tokped',
              },
            ],
            sampleCalculation: {
              input: {price: 100000, discount: 0, qty: 1, subtotalAfterDiscount: 100000},
              rows: [
                {
                  name: 'Biaya layanan',
                  calcFormula: '2% × 100000',
                  amountIdr: 2000,
                },
              ],
              totalFeeIdr: 2000,
              netAfterFeesIdr: 98000,
              disclaimer: 'Estimasi',
            },
            hasApprovedBaseline: true,
            sourceGroups: [],
          },
        ],
      },
    });
    expect(calc.platforms[0].totalFeeIdr).toBe(2000);
    expect(calc.platforms[0].activeLines[0].name).toBe('Biaya layanan');
  });
});
