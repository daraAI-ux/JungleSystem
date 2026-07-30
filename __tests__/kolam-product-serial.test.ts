import {
  KOLAM_PRODUCT_SERIAL_ROOT,
  createInitialProductSerialListFilters,
  getKolamProductSerialOpnameLabel,
  getKolamProductSerialStatusLabel,
  getKolamProductSerialSurfaceMode,
  getKolamProductSerialTypeLabel,
  hasKolamProductSerialPermission,
  isKolamProductSerialListRoute,
  isKolamProductSerialOpnameRoute,
  isKolamProductSerialRoute,
  normalizeKolamProductSerialList,
  normalizeKolamProductSerialOpnameResult,
} from '../src/domain/kolam-product-serial';

describe('kolam product serial domain', () => {
  it('recognizes product serial routes', () => {
    expect(isKolamProductSerialRoute(KOLAM_PRODUCT_SERIAL_ROOT)).toBe(true);
    expect(isKolamProductSerialRoute('/product-serials/opname')).toBe(true);
    expect(isKolamProductSerialRoute('/products')).toBe(false);

    expect(isKolamProductSerialListRoute(KOLAM_PRODUCT_SERIAL_ROOT)).toBe(true);
    expect(isKolamProductSerialListRoute('/product-serials/opname')).toBe(false);

    expect(isKolamProductSerialOpnameRoute('/product-serials/opname')).toBe(true);
    expect(isKolamProductSerialOpnameRoute(KOLAM_PRODUCT_SERIAL_ROOT)).toBe(false);

    expect(getKolamProductSerialSurfaceMode('/product-serials/opname')).toBe('opname');
    expect(getKolamProductSerialSurfaceMode(KOLAM_PRODUCT_SERIAL_ROOT)).toBe('list');
    expect(getKolamProductSerialSurfaceMode('/product-serials?productId=p1')).toBe('list');
  });

  it('normalizes a product serial list payload', () => {
    const result = normalizeKolamProductSerialList({
      data: [
        {
          _id: 'serial-1',
          serialNumber: 'FRY-20260101-0001',
          productId: { _id: 'p1', name: 'Produk A', sku: 'SKU-A' },
          productionId: {
            _id: 'prod-1',
            batchId: 'BATCH-001',
            quantity: 10,
            completedQuantity: 10,
            productionDate: '2026-01-01T00:00:00.000Z',
          },
          productType: 'freyer',
          status: 'in-stock',
          productionDate: '2026-01-01T00:00:00.000Z',
          registrationDate: '2026-01-02T00:00:00.000Z',
          qrCode: 'data:image/png;base64,abc123',
          opnameStatus: 'found',
          opnameAt: '2026-01-03T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    expect(result.data).toHaveLength(1);
    expect(result.pagination).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });

    const serial = result.data[0];
    expect(serial).toMatchObject({
      id: 'serial-1',
      serialNumber: 'FRY-20260101-0001',
      productType: 'freyer',
      status: 'in-stock',
      opnameStatus: 'found',
    });
    expect(serial.product).toMatchObject({ id: 'p1', name: 'Produk A', sku: 'SKU-A' });
    expect(serial.production).toMatchObject({ id: 'prod-1', batchId: 'BATCH-001' });
  });

  it('normalizes an empty list payload with fallback pagination', () => {
    const result = normalizeKolamProductSerialList({ data: [] });
    expect(result.data).toEqual([]);
    expect(result.pagination).toMatchObject({ page: 1, total: 0 });
  });

  it('normalizes an opname result payload (found + not found)', () => {
    const found = normalizeKolamProductSerialOpnameResult({
      found: true,
      serialNumber: 'FRY-20260101-0001',
      message: 'Serial number ditemukan',
      data: {
        _id: 'serial-1',
        serialNumber: 'FRY-20260101-0001',
        productType: 'freyer',
        status: 'in-stock',
        productName: 'Produk A',
        productSku: 'SKU-A',
        batchId: 'BATCH-001',
        opnameAt: '2026-01-03T00:00:00.000Z',
      },
    });
    expect(found.found).toBe(true);
    expect(found.data).toMatchObject({
      serialNumber: 'FRY-20260101-0001',
      productName: 'Produk A',
      batchId: 'BATCH-001',
    });

    const notFound = normalizeKolamProductSerialOpnameResult({
      found: false,
      serialNumber: 'NOT-EXIST',
      message: 'Serial number tidak ditemukan dalam sistem',
    });
    expect(notFound.found).toBe(false);
    expect(notFound.data).toBeNull();
  });

  it('maps status, type, and opname labels in Indonesian', () => {
    expect(getKolamProductSerialStatusLabel('in-stock')).toBe('Tersedia');
    expect(getKolamProductSerialStatusLabel('sold')).toBe('Terjual');
    expect(getKolamProductSerialStatusLabel('void')).toBe('Batal');

    expect(getKolamProductSerialTypeLabel('freyer')).toBe('Freyer');
    expect(getKolamProductSerialTypeLabel('enclonura')).toBe('Enclonura');
    expect(getKolamProductSerialTypeLabel('general')).toBe('Umum');

    expect(getKolamProductSerialOpnameLabel('found')).toBe('Ditemukan');
    expect(getKolamProductSerialOpnameLabel('missing')).toBe('Hilang');
    expect(getKolamProductSerialOpnameLabel(null)).toBe('—');
  });

  it('parses initial list filters from route query, including productId', () => {
    const filters = createInitialProductSerialListFilters(
      '/product-serials?productId=p1&search=FRY&productType=freyer&status=in-stock&page=2',
    );
    expect(filters).toMatchObject({
      page: 2,
      limit: 20,
      search: 'FRY',
      productType: 'freyer',
      status: 'in-stock',
      productId: 'p1',
    });
  });

  it('defaults filters when route has no query string', () => {
    const filters = createInitialProductSerialListFilters(KOLAM_PRODUCT_SERIAL_ROOT);
    expect(filters).toEqual({
      page: 1,
      limit: 20,
      search: '',
      productType: '',
      status: '',
      productId: '',
    });
  });

  it('checks product serial permissions by resource stock-transaction and role', () => {
    const permissions = [{ resource: 'stock-transaction', actions: ['view', 'opname'] }];

    expect(hasKolamProductSerialPermission(permissions, 'view')).toBe(true);
    expect(hasKolamProductSerialPermission(permissions, 'opname')).toBe(true);
    expect(
      hasKolamProductSerialPermission([{ resource: 'production', actions: ['view'] }], 'view'),
    ).toBe(false);
    expect(hasKolamProductSerialPermission(permissions, 'opname', 'super_admin')).toBe(true);
    expect(hasKolamProductSerialPermission(null, 'view')).toBe(true);
    expect(
      hasKolamProductSerialPermission([{ resource: '*', actions: ['*'] }], 'opname'),
    ).toBe(true);
  });
});
