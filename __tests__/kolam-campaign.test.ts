import {
  buildKolamCampaignDetailRoute,
  buildKolamCampaignEditRoute,
  countKolamCampaignVariants,
  formatKolamCampaignDiscountLabel,
  formatKolamCampaignDurationLabel,
  formatKolamCampaignStatusLabel,
  getKolamCampaignIdFromRoute,
  getKolamCampaignRouteMode,
  getKolamCampaignStatusIntent,
  isKolamCampaignRoute,
  normalizeKolamCampaign,
  normalizeKolamCampaignList,
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

  it('normalizes a single campaign payload', () => {
    const campaign = normalizeKolamCampaign({
      data: {
        _id: { $oid: 'oid1' },
        title: 'Nested',
        startDate: { $date: '2026-03-01T00:00:00.000Z' },
        endDate: '2026-03-05T00:00:00.000Z',
        discountType: 'fixed',
        discountValue: '5000',
        status: 'ended',
        products: [{ productId: 'p9', variantIds: ['a'] }],
      },
    });

    expect(campaign.id).toBe('oid1');
    expect(campaign.status).toBe('ended');
    expect(campaign.startDate).toBe('2026-03-01T00:00:00.000Z');
    expect(campaign.discountValue).toBe(5000);
    expect(formatKolamCampaignDurationLabel(campaign)).toBe('4 hari');
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
    expect(nav?.label).toMatch(/Kampanye/);
    expect(nav?.description).toBe(
      'Kelola semua kampanye pemasaran dan promosi.',
    );
    expect(getKolamNavigationRouteTarget(nav!).moduleId).toBe('kolam');
  });
});
