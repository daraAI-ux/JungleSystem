import {
  formatKolamLayananUnitPrice,
  getKolamLayananListTab,
  getKolamLayananRouteMode,
  getKolamLayananServiceIdFromRoute,
  getKolamLayananTaskTypeLabel,
  isKolamLayananNativeRoute,
  normalizeKolamLayananServiceList,
} from '../src/domain/kolam-layanan';
import {
  getKolamNavigationItemByRoute,
} from '../src/domain/kolam-navigation';

describe('kolam-layanan domain', () => {
  it('parses layanan routes and tabs', () => {
    expect(isKolamLayananNativeRoute('/layanan')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan?tab=operasional')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/create')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/abc')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/abc/edit')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/langganan/s1')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/voucher/v1')).toBe(true);
    expect(
      isKolamLayananNativeRoute('/layanan/voucher/v1/execution/e1'),
    ).toBe(true);
    expect(isKolamLayananNativeRoute('/sales')).toBe(false);

    expect(getKolamLayananRouteMode('/layanan')).toBe('list');
    expect(getKolamLayananRouteMode('/layanan?tab=langganan')).toBe('list');
    expect(getKolamLayananRouteMode('/layanan/create')).toBe('create');
    expect(getKolamLayananRouteMode('/layanan/abc')).toBe('detail');
    expect(getKolamLayananRouteMode('/layanan/abc/edit')).toBe('edit');
    expect(getKolamLayananRouteMode('/layanan/langganan/s1')).toBe('langganan');
    expect(getKolamLayananRouteMode('/layanan/voucher/v1')).toBe('voucher');
    expect(getKolamLayananRouteMode('/layanan/voucher/v1/execution/e1')).toBe(
      'execution',
    );

    expect(getKolamLayananListTab('/layanan')).toBe('daftar');
    expect(getKolamLayananListTab('/layanan?tab=operasional')).toBe(
      'operasional',
    );
    expect(getKolamLayananListTab('/layanan?tab=langganan')).toBe('langganan');
    expect(getKolamLayananServiceIdFromRoute('/layanan/abc')).toBe('abc');
    expect(getKolamLayananServiceIdFromRoute('/layanan/create')).toBe(null);
  });

  it('normalizes service list payload with sibling pagination', () => {
    const list = normalizeKolamLayananServiceList({
      data: [
        {
          _id: 'svc1',
          name: 'Dosing Bulanan',
          sku: 'SVC-001',
          packageCode: 'PKG-D1',
          taskType: 'dosing',
          price_m3: 15000,
          price_km: 5000,
          brand: [{ _id: 'b1', name: 'DA' }],
        },
      ],
      pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
    });

    expect(list.items).toHaveLength(1);
    expect(list.items[0].name).toBe('Dosing Bulanan');
    expect(list.items[0].sku).toBe('SVC-001');
    expect(list.items[0].packageCode).toBe('PKG-D1');
    expect(list.items[0].brands[0].name).toBe('DA');
    expect(getKolamLayananTaskTypeLabel(list.items[0].taskType)).toBe('Dosing');
    expect(formatKolamLayananUnitPrice(list.items[0].priceM3, 'm3')).toBe(
      '15.0Rb/m³',
    );
    expect(list.page).toBe(2);
    expect(list.total).toBe(25);
    expect(list.totalPages).toBe(3);
  });
});

describe('kolam-layanan navigation', () => {
  it('keeps /layanan on kolam module with Indonesian copy', () => {
    const item = getKolamNavigationItemByRoute('/layanan');
    expect(item?.label).toBe('Layanan');
    expect(item?.description).toContain('Katalog paket');
    expect(item?.route).toBe('/layanan');
  });
});
