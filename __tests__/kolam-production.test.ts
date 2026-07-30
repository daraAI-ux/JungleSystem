import {
  KOLAM_PRODUCTION_ROOT,
  buildCreateProductionBody,
  canCancelKolamProduction,
  canRecalculateKolamProduction,
  createEmptyKolamProductionFormState,
  getAllowedNextProductionStatuses,
  getKolamProductionBreadcrumbPath,
  getKolamProductionEditRouteId,
  getKolamProductionHistoryStatusLabel,
  getKolamProductionRouteId,
  getKolamProductionStatusLabel,
  getKolamProductionTargetLabel,
  hasKolamProductionPermission,
  isKolamProductionCreateRoute,
  isKolamProductionDetailRoute,
  isKolamProductionEditRoute,
  isKolamProductionListRoute,
  isKolamProductionRoute,
  normalizeKolamProduction,
  normalizeKolamProductionList,
} from '../src/domain/kolam-production';

describe('kolam production domain', () => {
  it('recognizes production routes', () => {
    expect(isKolamProductionRoute(KOLAM_PRODUCTION_ROOT)).toBe(true);
    expect(isKolamProductionRoute('/production/prod-1')).toBe(true);
    expect(isKolamProductionRoute('/production/prod-1/edit')).toBe(true);
    expect(isKolamProductionRoute('/products')).toBe(false);

    expect(isKolamProductionListRoute(KOLAM_PRODUCTION_ROOT)).toBe(true);
    expect(isKolamProductionListRoute('/production/prod-1')).toBe(false);

    expect(isKolamProductionCreateRoute('/production/create')).toBe(true);
    expect(isKolamProductionCreateRoute('/production/prod-1')).toBe(false);

    expect(getKolamProductionRouteId('/production/prod-1')).toBe('prod-1');
    expect(getKolamProductionRouteId(KOLAM_PRODUCTION_ROOT)).toBe(null);
    expect(isKolamProductionDetailRoute('/production/prod-1')).toBe(true);
    expect(isKolamProductionDetailRoute('/production/prod-1/edit')).toBe(false);

    expect(getKolamProductionEditRouteId('/production/prod-1/edit')).toBe('prod-1');
    expect(isKolamProductionEditRoute('/production/prod-1/edit')).toBe(true);

    expect(getKolamProductionBreadcrumbPath('new')).toBe('/production/create');
    expect(
      getKolamProductionBreadcrumbPath('detail', { id: 'prod-1', batchId: 'BATCH-1' }),
    ).toBe('/production/prod-1');
    expect(
      getKolamProductionBreadcrumbPath('edit', { id: 'prod-1', batchId: 'BATCH-1' }),
    ).toBe('/production/prod-1/edit');
  });

  it('normalizes a production list payload', () => {
    const result = normalizeKolamProductionList({
      data: [
        {
          _id: 'prod-1',
          batchId: 'BATCH-001',
          targetType: 'product',
          product: { _id: 'p1', name: 'Produk A', sku: 'SKU-A' },
          quantity: 5,
          plannedQuantity: 5,
          completedQuantity: 0,
          estimatedCost: 150000,
          actualCost: 0,
          status: 'pending',
          componentsUsed: [
            {
              _id: 'comp-1',
              product: { _id: 'rm1', name: 'Bahan X', sku: 'RM-X', price: 1000 },
              quantity: 10,
              unit: { initial: 'kg', name: 'Kilogram' },
            },
          ],
          productionHistories: [
            {
              _id: 'h1',
              status: 'created',
              note: 'Initial',
              changedBy: { first_name: 'Budi', last_name: 'Santoso' },
              changedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.total).toBe(1);

    const production = result.data[0];
    expect(production).toMatchObject({
      id: 'prod-1',
      batchId: 'BATCH-001',
      status: 'pending',
      plannedQuantity: 5,
      estimatedCost: 150000,
    });
    expect(production.product?.name).toBe('Produk A');
    expect(production.componentsUsed[0]?.productName).toBe('Bahan X');
    expect(production.componentsUsed[0]?.unit?.initial).toBe('kg');
    expect(production.productionHistories[0]?.changedByName).toBe('Budi Santoso');
  });

  it('normalizes single production detail payload', () => {
    const production = normalizeKolamProduction({
      data: {
        _id: 'prod-2',
        batchId: 'BATCH-002',
        targetType: 'species',
        species: { _id: 's1', scientificName: 'Species A', commonName: 'Common A' },
        status: 'waiting_for_po',
        linkedPurchaseOrders: [
          {
            po: { _id: 'po1', poCode: 'PO-001', status: 'draft', vendor: { name: 'Vendor A' } },
            status: 'draft',
            createdAt: '2026-01-02T00:00:00.000Z',
          },
        ],
      },
    });

    expect(production.id).toBe('prod-2');
    expect(production.status).toBe('waiting_for_po');
    expect(getKolamProductionTargetLabel(production)).toBe('Species A');
    expect(production.linkedPurchaseOrders[0]?.poCode).toBe('PO-001');
    expect(production.linkedPurchaseOrders[0]?.vendorName).toBe('Vendor A');
  });

  it('maps status labels in Indonesian', () => {
    expect(getKolamProductionStatusLabel('waiting_for_po')).toBe('Menunggu PO');
    expect(getKolamProductionStatusLabel('pending')).toBe('Menunggu');
    expect(getKolamProductionStatusLabel('in_progress')).toBe('Sedang berjalan');
    expect(getKolamProductionStatusLabel('on_check')).toBe('Pemeriksaan');
    expect(getKolamProductionStatusLabel('completed')).toBe('Selesai');
    expect(getKolamProductionStatusLabel('cancelled')).toBe('Dibatalkan');
    expect(getKolamProductionHistoryStatusLabel('submitted_for_check')).toBe(
      'Dikirim untuk Pemeriksaan',
    );
  });

  it('exposes allowed next statuses without legacy in_progress complete', () => {
    expect(getAllowedNextProductionStatuses('pending')).toEqual(['in_progress']);
    expect(getAllowedNextProductionStatuses('in_progress')).toEqual([]);
    expect(getAllowedNextProductionStatuses('on_check')).toEqual([]);
    expect(getAllowedNextProductionStatuses('waiting_for_po')).toEqual([]);
  });

  it('gates cancel and recalculate helpers by status', () => {
    expect(canCancelKolamProduction('pending')).toBe(true);
    expect(canCancelKolamProduction('in_progress')).toBe(true);
    expect(canCancelKolamProduction('on_check')).toBe(false);
    expect(canRecalculateKolamProduction('pending')).toBe(true);
    expect(canRecalculateKolamProduction('completed')).toBe(false);
    expect(canRecalculateKolamProduction('cancelled')).toBe(false);
  });

  it('checks production permissions by resource and role', () => {
    const permissions = [{ resource: 'production', actions: ['view', 'create'] }];

    expect(hasKolamProductionPermission(permissions, 'view')).toBe(true);
    expect(hasKolamProductionPermission(permissions, 'create')).toBe(true);
    expect(hasKolamProductionPermission(permissions, 'delete')).toBe(false);
    expect(hasKolamProductionPermission(permissions, 'update', 'super_admin')).toBe(true);
    expect(hasKolamProductionPermission(null, 'view')).toBe(true);
  });

  it('builds create body with product for serial freyer mode', () => {
    const form = {
      ...createEmptyKolamProductionFormState(),
      serialEnabled: true,
      productId: 'prod-serial-1',
      quantity: '2',
      description: 'Batch serial',
      assignedToId: 'user-1',
    };
    const body = buildCreateProductionBody(form);
    expect(body).toMatchObject({
      targetType: 'freyer',
      product: 'prod-serial-1',
      serialEnabled: true,
      quantity: 2,
    });
    expect(body).not.toHaveProperty('freyer');
  });
});
