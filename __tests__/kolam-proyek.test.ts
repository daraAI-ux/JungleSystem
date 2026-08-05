import {
  buildKolamProyekDetailRoute,
  buildKolamProyekDetailRouteForItem,
  buildKolamProyekEditRoute,
  buildKolamProyekListRoute,
  buildKolamProyekNewRoute,
  formatKolamProyekLifecycleLabel,
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

describe('kolam-proyek domain (P0)', () => {
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

  it('normalizes list envelope and detail summary', () => {
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
    expect(list.total).toBe(1);
    expect(list.items[0]).toEqual(
      expect.objectContaining({
        id: '507f1f77bcf86cd799439011',
        quotationNumber: 'QUO-1',
        lifecycleStatus: 'in_progress',
        clientName: 'Andi',
        designerName: 'Budi',
        progressPercent: 40,
        contractValue: 1500000,
      }),
    );

    const detail = normalizeKolamProyekDetail({
      data: {
        _id: '507f1f77bcf86cd799439011',
        quotationNumber: 'QUO-1',
        lifecycleStatus: 'draft',
        items: [{ itemType: 'custom', quantity: 1, unitPrice: 1, subtotal: 1 }],
        progressNote: 'Mulai',
      },
    });
    expect(detail?.itemCount).toBe(1);
    expect(detail?.progressNote).toBe('Mulai');
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
  });
});
