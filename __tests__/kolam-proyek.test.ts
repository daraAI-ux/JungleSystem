import {
  buildKolamProyekDetailRoute,
  buildKolamProyekDetailRouteForItem,
  buildKolamProyekEditRoute,
  buildKolamProyekListRoute,
  buildKolamProyekNewRoute,
  canEditKolamProyekQuotation,
  computeKolamProyekCostBreakdown,
  formatKolamProyekLifecycleLabel,
  formatKolamProyekPaymentModeLabel,
  getKolamProyekAllowedNext,
  getKolamProyekHappyPathNext,
  getKolamProyekLifecycleIntent,
  getKolamProyekRouteRef,
  getKolamProyekSectionVisibility,
  getKolamProyekSurfaceMode,
  isKolamProyekDetailRoute,
  isKolamProyekEditRoute,
  isKolamProyekListRoute,
  isKolamProyekNewRoute,
  isKolamProyekQuotationRef,
  isKolamProyekRoute,
  normalizeKolamProyekDetail,
  normalizeKolamProyekList,
} from '../src/domain/kolam-proyek';

describe('kolam-proyek domain', () => {
  it('detects canonical and legacy routes', () => {
    expect(isKolamProyekRoute('/proyek')).toBe(true);
    expect(isKolamProyekRoute('/proyek/QUO-1')).toBe(true);
    expect(isKolamProyekRoute('/custom-project/instances/abc')).toBe(true);
    expect(isKolamProyekListRoute('/proyek')).toBe(true);
    expect(isKolamProyekListRoute('/proyek/instances')).toBe(true);
    expect(isKolamProyekListRoute('/custom-project')).toBe(true);
    expect(isKolamProyekNewRoute('/proyek/new')).toBe(true);
    expect(isKolamProyekNewRoute('/custom-project/instances/new')).toBe(true);
    expect(isKolamProyekDetailRoute('/proyek/QUO-1')).toBe(true);
    expect(isKolamProyekDetailRoute('/custom-project/instances/abc')).toBe(
      true,
    );
    expect(isKolamProyekDetailRoute('/proyek/new')).toBe(false);
    expect(isKolamProyekEditRoute('/proyek/abc/edit')).toBe(true);
    expect(getKolamProyekRouteRef('/proyek/QUO-12')).toBe('QUO-12');
    expect(getKolamProyekRouteRef('/custom-project/instances/abc')).toBe(
      'abc',
    );
    expect(getKolamProyekSurfaceMode('/proyek')).toBe('list');
    expect(getKolamProyekSurfaceMode('/proyek/new')).toBe('new');
    expect(getKolamProyekSurfaceMode('/proyek/x')).toBe('detail');
    expect(getKolamProyekSurfaceMode('/proyek/x/edit')).toBe('edit');
  });

  it('builds canonical paths preferring quotation ref', () => {
    expect(buildKolamProyekListRoute()).toBe('/proyek');
    expect(buildKolamProyekNewRoute()).toBe('/proyek/new');
    expect(buildKolamProyekDetailRoute('QUO-1')).toBe('/proyek/QUO-1');
    expect(isKolamProyekQuotationRef('QUO-99')).toBe(true);
    expect(
      buildKolamProyekDetailRouteForItem({
        id: 'id1',
        quotationNumber: 'QUO-9',
      }),
    ).toBe('/proyek/QUO-9');
    expect(buildKolamProyekEditRoute('id1', 'id1')).toBe('/proyek/id1/edit');
    expect(buildKolamProyekEditRoute('QUO-1', 'id1')).toBe('/proyek/QUO-1/edit');
  });

  it('normalizes list and rich detail panels for P1', () => {
    const list = normalizeKolamProyekList({
      data: [
        {
          _id: '507f1f77bcf86cd799439011',
          quotationNumber: 'QUO-1',
          lifecycleStatus: 'in_progress',
          progressPercent: 40,
          contractValue: 1500000,
          clientUser: { _id: 'c1', name: 'Andi' },
          designerName: 'Budi',
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });

    expect(list.items).toHaveLength(1);
    expect(list.items[0]).toEqual(
      expect.objectContaining({
        quotationNumber: 'QUO-1',
        clientName: 'Andi',
        progressPercent: 40,
      }),
    );

    const detail = normalizeKolamProyekDetail({
      data: {
        _id: '507f1f77bcf86cd799439011',
        quotationNumber: 'QUO-1',
        lifecycleStatus: 'draft',
        contractValue: 2000000,
        hppManual: 100000,
        hppFromMaterials: [
          {
            product: { _id: 'p1', name: 'Pipa' },
            quantity: 2,
            unitCost: 50000,
            subtotal: 100000,
          },
        ],
        items: [
          {
            _id: 'i1',
            itemType: 'custom',
            customName: 'Desain custom',
            quantity: 1,
            unitPrice: 2000000,
            subtotal: 2000000,
          },
        ],
        dpSchedule: [
          {
            name: 'DP 1',
            amount: 1000000,
            amountReceived: 1000000,
            paidAt: '2026-08-01T00:00:00.000Z',
          },
        ],
        commissionConfig: {
          daType: 'percentage',
          daValue: 10,
          designerType: 'fixed',
          designerValue: 50000,
        },
        progressHistory: [
          {
            progressPercent: 20,
            progressNote: 'Awal',
            at: '2026-08-02T00:00:00.000Z',
          },
        ],
        linkedTask: {
          _id: 't1',
          title: 'Kerja proyek',
          status: 'in_progress',
          workProgressPercent: 55,
        },
        progressNote: 'Mulai',
        paymentMode: 'staged',
        varPreview: {
          contractValue: 2000000,
          unexpectedExpenseTotal: 0,
          materialsUsageTotal: 100000,
          varAmount: 1900000,
        },
      },
    });

    expect(detail?.items[0].title).toBe('Desain custom');
    expect(detail?.hppMaterials[0].label).toBe('Pipa');
    expect(detail?.dpSchedule).toHaveLength(1);
    expect(detail?.commissionConfig?.daValue).toBe(10);
    expect(detail?.linkedTask?.id).toBe('t1');
    expect(detail?.progressPercent).toBe(55);
    expect(detail?.costBreakdown.produkToko).toBe(100000);
    expect(detail?.costBreakdown.varAmount).toBe(1900000);
    expect(canEditKolamProyekQuotation(detail?.lifecycleStatus)).toBe(true);
    expect(formatKolamProyekPaymentModeLabel(detail?.paymentMode)).toBe(
      'DP berjenjang',
    );
  });

  it('exposes lifecycle labels, visibility, and transitions', () => {
    expect(formatKolamProyekLifecycleLabel('awaiting_dp')).toBe('Menunggu DP');
    expect(getKolamProyekLifecycleIntent('completed')).toBe('success');
    expect(getKolamProyekLifecycleIntent('cancelled')).toBe('danger');
    expect(getKolamProyekSectionVisibility('draft', 'dangerDelete')).toBe(
      'active',
    );
    expect(getKolamProyekSectionVisibility('draft', 'dpSchedule')).toBe(
      'hidden',
    );
    expect(getKolamProyekSectionVisibility('delivered', 'closeProject')).toBe(
      'active',
    );
    expect(getKolamProyekHappyPathNext('draft')).toEqual(['quotation_sent']);
    expect(getKolamProyekAllowedNext('draft')).toEqual([
      'quotation_sent',
      'cancelled',
    ]);
    expect(canEditKolamProyekQuotation('quotation_sent')).toBe(false);
    expect(
      computeKolamProyekCostBreakdown({
        contractValue: 1000,
        hppMaterials: [
          { id: '1', label: 'A', quantity: 1, unitCost: 100, subtotal: 100 },
        ],
        hppManual: 50,
        items: [],
        varPreview: null,
      }).totalHpp,
    ).toBe(150);
  });
});
