import {
  buildKolamCampaignDetailRoute,
  buildKolamCampaignEditRoute,
  calculateKolamCampaignPrice,
  countKolamCampaignVariants,
  createEmptyKolamCampaignFormState,
  createKolamCampaignFormState,
  createKolamCampaignSavePayload,
  formatKolamCampaignDiscountLabel,
  formatKolamCampaignDurationLabel,
  formatKolamCampaignPriceRange,
  formatKolamCampaignStatusLabel,
  getKolamCampaignIdFromRoute,
  getKolamCampaignRouteMode,
  getKolamCampaignStatusIntent,
  isKolamCampaignRoute,
  kolamCampaignApiDateToFormDate,
  kolamCampaignFormDateToApiIso,
  normalizeKolamCampaign,
  normalizeKolamCampaignList,
  validateKolamCampaignForm,
} from '../src/domain/kolam-campaign';
import { getKolamTableColumns } from '../src/domain/kolam-table';
import {
  getKolamNavigationItemByRoute,
  getKolamNavigationRouteTarget,
} from '../src/domain/kolam-navigation';

describe('kolam-campaign domain', () => {
  it('parses campaign routes and excludes DARA segments', () => {
    expect(isKolamCampaignRoute('/campaign')).toBe(true);
    expect(isKolamCampaignRoute('/campaign/create')).toBe(true);
    expect(isKolamCampaignRoute('/campaign/abc')).toBe(true);
    expect(isKolamCampaignRoute('/campaign/abc/edit')).toBe(true);
    expect(isKolamCampaignRoute('/campaign/dara-seo')).toBe(false);
    expect(isKolamCampaignRoute('/campaign/dara-jobs')).toBe(false);
    expect(isKolamCampaignRoute('/sales')).toBe(false);

    expect(getKolamCampaignRouteMode('/campaign')).toBe('list');
    expect(getKolamCampaignRouteMode('/campaign/create')).toBe('new');
    expect(getKolamCampaignRouteMode('/campaign/abc')).toBe('detail');
    expect(getKolamCampaignRouteMode('/campaign/abc/edit')).toBe('edit');
    expect(getKolamCampaignIdFromRoute('/campaign/abc/edit')).toBe('abc');
    expect(getKolamCampaignIdFromRoute('/campaign/create')).toBe(null);
    expect(getKolamCampaignIdFromRoute('/campaign/dara-seo')).toBe(null);
    expect(buildKolamCampaignDetailRoute('x1')).toBe('/campaign/x1');
    expect(buildKolamCampaignEditRoute('x1')).toBe('/campaign/x1/edit');
  });

  it('normalizes BE list envelope { total, page, limit, campaigns }', () => {
    const list = normalizeKolamCampaignList(
      {
        total: 2,
        page: 1,
        limit: 10,
        campaigns: [
          {
            _id: 'c1',
            title: 'Flash Sale',
            startDate: '2026-01-01T00:00:00.000Z',
            endDate: '2026-01-03T00:00:00.000Z',
            discountType: 'percentage',
            discountValue: 15,
            status: 'on_going',
            products: [
              { productId: 'p1', variantIds: ['v1', 'v2'] },
              { productId: 'p2', variantIds: [] },
            ],
            createdAt: '2025-12-01T00:00:00.000Z',
          },
          {
            id: 'c2',
            title: 'Planning',
            startDate: '2026-02-01T00:00:00.000Z',
            endDate: '2026-02-02T00:00:00.000Z',
            discountType: 'fixed',
            discountValue: 10000,
            status: 'on_planning',
            products: [],
          },
        ],
      },
      { page: 1, limit: 10 },
    );

    expect(list.total).toBe(2);
    expect(list.page).toBe(1);
    expect(list.limit).toBe(10);
    expect(list.items).toHaveLength(2);
    expect(list.items[0]).toEqual(
      expect.objectContaining({
        id: 'c1',
        title: 'Flash Sale',
        status: 'on_going',
        discountType: 'percentage',
        discountValue: 15,
      }),
    );
    expect(list.items[0].products).toHaveLength(2);
    expect(countKolamCampaignVariants(list.items[0])).toBe(2);
    expect(formatKolamCampaignStatusLabel(list.items[0].status)).toBe(
      'Berlangsung',
    );
    expect(getKolamCampaignStatusIntent(list.items[0].status)).toBe('success');
    expect(formatKolamCampaignDiscountLabel(list.items[0])).toBe('15% diskon');
    expect(formatKolamCampaignDurationLabel(list.items[0])).toBe('2 hari');
    expect(formatKolamCampaignDiscountLabel(list.items[1])).toContain('10');
  });

  it('normalizes enriched detail products and form/date helpers', () => {
    const campaign = normalizeKolamCampaign({
      _id: 'c9',
      title: 'Detail',
      startDate: '2026-03-01T00:00:00.000Z',
      endDate: '2026-03-05T00:00:00.000Z',
      discountType: 'percentage',
      discountValue: 10,
      status: 'on_going',
      products: [
        {
          productId: 'p1',
          variantIds: ['v1'],
          product: {
            _id: 'p1',
            name: 'Produk A',
            sku: 'SKU-A',
            thumbnailImage: 'media/a.png',
            price_to_sell: 100000,
            variants: [
              {
                _id: 'v1',
                tier1Value: 'S',
                price_to_sell: 100000,
              },
              {
                _id: 'v2',
                tier1Value: 'M',
                price_to_sell: 120000,
              },
            ],
          },
          variantDetails: [
            {
              _id: 'v1',
              label: 'S',
              price_to_sell: 100000,
            },
          ],
        },
      ],
    });

    expect(campaign.products[0].product?.name).toBe('Produk A');
    expect(campaign.products[0].product?.variants).toHaveLength(2);
    expect(campaign.products[0].variantDetails?.[0].label).toBe('S');

    const form = createKolamCampaignFormState(campaign);
    expect(form.title).toBe('Detail');
    expect(form.startDate).toBe(
      kolamCampaignApiDateToFormDate(campaign.startDate),
    );
    expect(form.products[0].productId).toBe('p1');
    expect(form.products[0].variantIds).toEqual(['v1']);

    const apiIso = kolamCampaignFormDateToApiIso('2026-03-01');
    expect(kolamCampaignApiDateToFormDate(apiIso)).toBe('2026-03-01');
    expect(Number.isFinite(Date.parse(apiIso))).toBe(true);

    expect(calculateKolamCampaignPrice(100000, campaign)).toBe(90000);
    expect(
      formatKolamCampaignPriceRange(
        campaign.products[0].variantDetails ?? [],
        campaign,
      ).campaign,
    ).toContain('90');
  });

  it('validates form and builds save payload like FE create', () => {
    const empty = createEmptyKolamCampaignFormState();
    expect(validateKolamCampaignForm(empty)).toBe('Judul kampanye wajib diisi');

    const invalidDates = {
      ...empty,
      title: 'Promo',
      startDate: '2026-04-10',
      endDate: '2026-04-10',
      discountValue: '10',
      products: [{ productId: 'p1', variantIds: [] }],
    };
    expect(validateKolamCampaignForm(invalidDates)).toBe(
      'Tanggal selesai harus setelah tanggal mulai',
    );

    const valid = {
      ...empty,
      title: ' Promo ',
      startDate: '2026-04-01',
      endDate: '2026-04-10',
      discountType: 'percentage' as const,
      discountValue: '15',
      status: 'on_planning' as const,
      products: [
        { productId: 'p1', variantIds: ['v1'] },
        { productId: '', variantIds: [] },
      ],
    };
    expect(validateKolamCampaignForm(valid)).toBeNull();
    expect(createKolamCampaignSavePayload(valid)).toEqual(
      expect.objectContaining({
        title: 'Promo',
        discountType: 'percentage',
        discountValue: 15,
        status: 'on_planning',
        products: [{ productId: 'p1', variantIds: ['v1'] }],
      }),
    );
    const payload = createKolamCampaignSavePayload(valid);
    expect(kolamCampaignApiDateToFormDate(payload.startDate)).toBe('2026-04-01');
    expect(kolamCampaignApiDateToFormDate(payload.endDate)).toBe('2026-04-10');
  });

  it('exposes FE-aligned table columns and navigation', () => {
    const columns = getKolamTableColumns('campaign');
    expect(columns.map(column => column.label)).toEqual([
      'Judul Kampanye',
      'Status',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Durasi',
      'Diskon',
      'Produk',
      'Dibuat',
      '',
    ]);

    const nav = getKolamNavigationItemByRoute('/campaign');
    expect(nav?.label).toBe('Daftar');
    expect(nav?.group).toBe('Kampanye');
    expect(nav?.description).toBe(
      'Kelola semua kampanye pemasaran dan promosi.',
    );
    expect(getKolamNavigationRouteTarget(nav!).moduleId).toBe('kolam');
  });
});
