import {
  createInitialStockOpnameListFilters,
  extractStockOpnameVariantsFromRaw,
  formatStockOpnameLineCounts,
  getKolamStockOpnameRouteId,
  getKolamStockOpnameSurfaceMode,
  hasKolamStockOpnamePermission,
  isKolamStockOpnameDetailRoute,
  isKolamStockOpnameListRoute,
  isKolamStockOpnameNewRoute,
  isKolamStockOpnameRoute,
  needsOpnameMinusReason,
  normalizeKolamStockOpname,
  normalizeKolamStockOpnameLine,
  normalizeKolamStockOpnameList,
  opnameMinusReasonLabel,
  stockOpnameLineStatusLabel,
  stockOpnameLineTargetLabel,
  stockOpnameStatusLabel,
  stockOpnameUserDisplayName,
} from '../src/domain/kolam-stock-opname';

describe('Kolam stock opname domain', () => {
  it('recognizes list, new, and detail routes', () => {
    expect(isKolamStockOpnameRoute('/stock-opname')).toBe(true);
    expect(isKolamStockOpnameRoute('/stock-opname?status=draft')).toBe(true);
    expect(isKolamStockOpnameRoute('/stock-opname/new')).toBe(true);
    expect(isKolamStockOpnameRoute('/stock-opname/abc123')).toBe(true);
    expect(isKolamStockOpnameRoute('/stock-transaction')).toBe(false);

    expect(isKolamStockOpnameListRoute('/stock-opname')).toBe(true);
    expect(isKolamStockOpnameListRoute('/stock-opname/new')).toBe(false);
    expect(isKolamStockOpnameNewRoute('/stock-opname/new')).toBe(true);
    expect(isKolamStockOpnameDetailRoute('/stock-opname/doc-1')).toBe(true);
    expect(getKolamStockOpnameRouteId('/stock-opname/doc-1')).toBe('doc-1');
    expect(getKolamStockOpnameRouteId('/stock-opname/new')).toBeNull();
    expect(getKolamStockOpnameSurfaceMode('/stock-opname')).toBe('list');
    expect(getKolamStockOpnameSurfaceMode('/stock-opname/new')).toBe('new');
    expect(getKolamStockOpnameSurfaceMode('/stock-opname/x')).toBe('detail');
  });

  it('parses list filters from route query', () => {
    const filters = createInitialStockOpnameListFilters(
      '/stock-opname?status=in_review&startDate=2026-01-01&page=2&search=OPN&limit=20',
    );

    expect(filters).toEqual({
      search: 'OPN',
      status: 'in_review',
      startDate: '2026-01-01',
      endDate: '',
      page: 2,
      limit: 20,
      sort: 'createdAt:desc',
    });
  });

  it('normalizes list payload with status labels and owner display', () => {
    const result = normalizeKolamStockOpnameList({
      data: [
        {
          _id: 'op-1',
          documentNumber: 'SO-2026-001',
          status: 'draft',
          note: 'Rak A',
          ownerId: {
            _id: 'u1',
            first_name: 'Ada',
            last_name: 'Lovelace',
            email: 'ada@example.com',
          },
          createdAt: '2026-07-01T00:00:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: 'op-1',
      documentNumber: 'SO-2026-001',
      status: 'draft',
      statusLabel: 'Draf',
      note: 'Rak A',
      ownerId: 'u1',
    });
    expect(stockOpnameUserDisplayName(result.data[0]?.owner)).toBe(
      'Ada Lovelace',
    );
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it('normalizes line payload with target and minus reason', () => {
    const line = normalizeKolamStockOpnameLine({
      _id: 'line-1',
      stockOpnameId: 'op-1',
      lineNo: 2,
      targetType: 'product',
      productId: {
        _id: 'p1',
        name: 'Produk A',
        sku: 'SKU-A',
        units: { initial: 'pcs' },
      },
      variant: 'v1',
      variantLabel: 'Merah',
      systemQty: 10,
      physicalQty: 7,
      minusReason: 'lost',
      lineStatus: 'pending_review',
      photos: ['a.jpg'],
    });

    expect(line).toMatchObject({
      id: 'line-1',
      lineNo: 2,
      targetType: 'product',
      targetTypeLabel: 'Produk',
      productId: 'p1',
      variantId: 'v1',
      variantLabel: 'Merah',
      unitLabel: 'pcs',
      systemQty: 10,
      physicalQty: 7,
      minusReason: 'lost',
      minusReasonLabel: 'Hilang',
      lineStatus: 'pending_review',
      lineStatusLabel: 'Menunggu review',
      photos: ['a.jpg'],
    });
    expect(stockOpnameLineTargetLabel(line)).toBe('Produk A');
  });

  it('labels species lines with scientificName like FE', () => {
    const line = normalizeKolamStockOpnameLine({
      _id: 'line-sp',
      stockOpnameId: 'op-1',
      lineNo: 1,
      targetType: 'species',
      speciesId: {
        _id: 'sp1',
        scientificName: 'Dendrobates tinctorius',
        units: { initial: 'ekor' },
      },
      systemQty: 4,
      physicalQty: 4,
      lineStatus: 'draft',
    });

    expect(line.species).toMatchObject({
      id: 'sp1',
      scientificName: 'Dendrobates tinctorius',
      name: 'Dendrobates tinctorius',
      unitLabel: 'ekor',
    });
    expect(stockOpnameLineTargetLabel(line)).toBe('Dendrobates tinctorius');
    expect(stockOpnameLineTargetLabel(line)).not.toBe('Livestock');
  });

  it('maps status and minus-reason helpers like FE', () => {
    expect(stockOpnameStatusLabel('ready_to_post')).toBe('Siap posting');
    expect(stockOpnameLineStatusLabel('draft')).toBe('Draf');
    expect(opnameMinusReasonLabel('damaged')).toBe('Rusak');
    expect(needsOpnameMinusReason('product', -1)).toBe(true);
    expect(needsOpnameMinusReason('product', 1)).toBe(false);
    expect(needsOpnameMinusReason('packing', -1)).toBe(false);
  });

  it('extracts variants only when variantConfig is present', () => {
    expect(
      extractStockOpnameVariantsFromRaw({
        variants: [{ _id: 'v1', name: 'Merah', stock: 3 }],
      }),
    ).toEqual([]);

    expect(
      extractStockOpnameVariantsFromRaw({
        variantConfig: { enabled: true },
        variants: [
          { _id: 'v1', name: 'Merah', stock: 3 },
          { id: 'v2', label: 'Biru', currentStock: 1 },
        ],
      }),
    ).toEqual([
      { id: 'v1', label: 'Merah', stock: 3 },
      { id: 'v2', label: 'Biru', stock: 1 },
    ]);
  });

  it('gates stock-opname actions by role permissions', () => {
    expect(
      hasKolamStockOpnamePermission(undefined, 'create', 'staff'),
    ).toBe(true);
    expect(
      hasKolamStockOpnamePermission([], 'create', 'staff'),
    ).toBe(false);
    expect(
      hasKolamStockOpnamePermission(
        [{ resource: 'stock-opname', actions: ['view', 'create'] }],
        'create',
        'staff',
      ),
    ).toBe(true);
    expect(
      hasKolamStockOpnamePermission(
        [{ resource: 'stock-opname', actions: ['view'] }],
        'post',
        'staff',
      ),
    ).toBe(false);
    expect(
      hasKolamStockOpnamePermission([], 'post', 'super_administrator'),
    ).toBe(true);
    expect(
      formatStockOpnameLineCounts({
        draft: 2,
        pending_review: 1,
        approved: 0,
      }),
    ).toBe('Draf: 2 · Menunggu review: 1');
  });

  it('normalizes single document with parent/continuation refs', () => {
    const doc = normalizeKolamStockOpname({
      data: {
        _id: 'op-2',
        documentNumber: 'SO-2',
        status: 'partially_posted',
        parentOpnameId: { _id: 'op-1', documentNumber: 'SO-1' },
        continuationOpnameId: 'op-3',
      },
    });

    expect(doc).toMatchObject({
      id: 'op-2',
      status: 'partially_posted',
      statusLabel: 'Diposting sebagian',
      parentOpname: { id: 'op-1', documentNumber: 'SO-1' },
      continuationOpname: { id: 'op-3', documentNumber: 'op-3' },
    });
  });
});
