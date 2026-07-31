import {
  buildKolamLayananOpsKpiCards,
  createEmptyKolamLayananServiceFormState,
  createKolamLayananServiceSavePayload,
  formatKolamLayananUnitPrice,
  getKolamLayananListTab,
  getKolamLayananRouteMode,
  getKolamLayananServiceIdFromRoute,
  getKolamLayananSubscriptionStatusLabel,
  getKolamLayananTaskTypeLabel,
  isKolamLayananNativeRoute,
  normalizeKolamLayananOpsDashboard,
  normalizeKolamLayananPendingList,
  normalizeKolamLayananServiceList,
  normalizeKolamLayananSubscriptionList,
  validateKolamLayananServiceForm,
} from '../src/domain/kolam-layanan';
import { getKolamNavigationItemByRoute } from '../src/domain/kolam-navigation';

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
    expect(getKolamLayananServiceIdFromRoute('/layanan/abc/edit')).toBe('abc');
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

  it('normalizes ops dashboard, pending list, and subscriptions', () => {
    const ops = normalizeKolamLayananOpsDashboard({
      data: {
        subscriptions: { active: 4 },
        visits: { scheduledToday: 2 },
        hpp: { totalThisMonth: 250000 },
        capacity: {
          period: { periodStart: '2026-07-01', periodEnd: '2026-07-30' },
          summary: { fullSlots: 3, limitedSlots: 5, totalSlots: 28 },
          slots: [
            {
              week: 1,
              weekday: 1,
              status: 'limited',
              booked: 2,
              capacity: 3,
              remaining: 1,
              dates: ['2026-07-07'],
            },
          ],
        },
        alerts: {
          overdue: [
            {
              pendingServiceId: 'ps1',
              executionId: 'ex1',
              visitTitle: 'Dosing A',
              scheduledTime: '2026-07-30T08:00:00.000Z',
            },
          ],
          pendingSupervisor: [],
          pendingCustomerConfirm: [],
        },
      },
    });
    expect(ops.activeSubscriptions).toBe(4);
    expect(ops.scheduledToday).toBe(2);
    expect(ops.fullSlots).toBe(3);
    expect(ops.slots).toHaveLength(1);
    expect(ops.alerts.overdue[0].href).toContain(
      '/layanan/voucher/ps1/execution/ex1',
    );
    expect(buildKolamLayananOpsKpiCards(ops)[0].value).toBe('4');

    const pending = normalizeKolamLayananPendingList({
      data: [
        {
          _id: 'ps1',
          serviceSerial: 'VCH-1',
          status: 'pending',
          packageCode: 'PKG',
          service: { name: 'Dosing' },
          sale: { invoiceCode: 'INV-1', customer: { name: 'Budi' } },
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 2,
        totalDocuments: 12,
        limit: 10,
      },
    });
    expect(pending.items[0].serviceSerial).toBe('VCH-1');
    expect(pending.items[0].customerName).toBe('Budi');
    expect(pending.total).toBe(12);
    expect(pending.totalPages).toBe(2);

    const subs = normalizeKolamLayananSubscriptionList({
      data: [
        {
          _id: 'sub1',
          subscriptionNumber: 'SUB-1',
          status: 'active',
          autoRenew: true,
          customer: { name: 'Ani' },
          service: { name: 'Paket A', packageCode: 'PA' },
          pendingService: { _id: 'ps1', serviceSerial: 'VCH-1' },
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    expect(subs.items[0].subscriptionNumber).toBe('SUB-1');
    expect(subs.items[0].voucherId).toBe('ps1');
    expect(getKolamLayananSubscriptionStatusLabel('active')).toBe('Aktif');
  });

  it('builds and validates service create/edit payload', () => {
    const empty = createEmptyKolamLayananServiceFormState();
    expect(validateKolamLayananServiceForm(empty)).toContain('Nama');

    const form = {
      ...empty,
      name: 'Dosing Bulanan',
      sku: 'SVC-1',
      brandIds: ['b1'],
      enclosureTaskTypeKeys: ['dosing'],
      enclosureTypes: ['Terrarium'],
      taskType: 'dosing',
      packageCode: 'sv-01',
      price: '100000',
      priceM3: '15000',
      visitsPerMonth: '2',
      contractDurationValue: '3',
      contractDurationUnit: 'months' as const,
    };
    expect(validateKolamLayananServiceForm(form)).toBeNull();
    const body = createKolamLayananServiceSavePayload(form);
    expect(body.name).toBe('Dosing Bulanan');
    expect(body.brand).toEqual(['b1']);
    expect(body.packageCode).toBe('SV-01');
    expect(body.visitsPerMonth).toBe(2);
    expect(body.taskType).toBe('dosing');
    expect(body.price_m3).toBe(15000);
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
