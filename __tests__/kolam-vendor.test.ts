import {
  buildKolamSupplierAnalyticsQuery,
  createEmptyKolamVendorFormState,
  createKolamVendorFormState,
  createKolamVendorSavePayload,
  flattenKolamSupplierProductRows,
  flattenKolamSupplierSpeciesRows,
  formatKolamVendorAddress,
  getKolamSupplierBreadcrumbPath,
  getKolamSupplierEditRouteId,
  getKolamSupplierRouteId,
  getKolamVendorStatusLabel,
  hasKolamVendorPurchaseAnalytics,
  isKolamSupplierCreateRoute,
  isKolamSupplierRoute,
  normalizeKolamVendor,
  normalizeKolamVendorDetail,
  normalizeKolamVendorList,
} from '../src/domain/kolam-vendor';

describe('kolam vendor / supplier domain', () => {
  it('recognizes supplier routes', () => {
    expect(isKolamSupplierRoute('/suppliers')).toBe(true);
    expect(isKolamSupplierRoute('/suppliers/abc')).toBe(true);
    expect(isKolamSupplierRoute('/suppliers/abc/edit')).toBe(true);
    expect(isKolamSupplierRoute('/products')).toBe(false);
    expect(getKolamSupplierRouteId('/suppliers/abc')).toBe('abc');
    expect(getKolamSupplierRouteId('/suppliers')).toBe(null);
    expect(getKolamSupplierRouteId('/suppliers/create')).toBe(null);
    expect(getKolamSupplierEditRouteId('/suppliers/abc/edit')).toBe('abc');
    expect(getKolamSupplierEditRouteId('/suppliers/abc')).toBe(null);
    expect(isKolamSupplierCreateRoute('/suppliers/create')).toBe(true);
    expect(getKolamSupplierBreadcrumbPath('new')).toBe('/suppliers/create');
    expect(
      getKolamSupplierBreadcrumbPath('edit', { id: 'abc', name: 'X' }),
    ).toBe('/suppliers/abc/edit');
  });

  it('builds form state and save payload', () => {
    const empty = createEmptyKolamVendorFormState();
    expect(empty).toMatchObject({
      name: '',
      status: 'active',
      country: 'Indonesia',
      brandIds: [],
      linkText: '',
      isOfficialDistributor: false,
    });

    const form = createKolamVendorFormState(
      normalizeKolamVendor({
        _id: 'v1',
        name: 'Pemasok Satu',
        email: '-',
        phone: '0812',
        status: 'inactive',
        brands: [{ _id: 'b1', name: 'Merek A' }],
        link: ['https://a.example', 'https://b.example'],
        isOfficialDistributor: true,
        warrantyContactNote: 'WA 0811',
        photos: ['uploads/vendors/a.jpg', 'uploads/vendors/b.jpg'],
      }),
    );

    expect(form).toMatchObject({
      id: 'v1',
      name: 'Pemasok Satu',
      email: '',
      phone: '0812',
      status: 'inactive',
      brandIds: ['b1'],
      linkText: 'https://a.example\nhttps://b.example',
      isOfficialDistributor: true,
      warrantyContactNote: 'WA 0811',
    });

    const vendor = normalizeKolamVendor({
      _id: 'v1',
      name: 'Pemasok Satu',
      photos: ['uploads/vendors/a.jpg'],
    });
    expect(vendor.photos).toEqual(['uploads/vendors/a.jpg']);
    expect(vendor.photoUrls[0]).toContain('uploads/vendors/a.jpg');

    expect(createKolamVendorSavePayload(form)).toMatchObject({
      name: 'Pemasok Satu',
      email: '-',
      phone: '0812',
      brands: ['b1'],
      link: ['https://a.example', 'https://b.example'],
      status: 'inactive',
      isOfficialDistributor: true,
      warrantyContactNote: 'WA 0811',
    });
  });

  it('normalizes list and detail vendor payloads', () => {
    const list = normalizeKolamVendorList({
      data: [
        {
          _id: 'v1',
          name: 'Pemasok Satu',
          email: 'a@example.com',
          phone: '081234567890',
          status: 'active',
          isOfficialDistributor: true,
          city: 'Jakarta',
          country: 'Indonesia',
          poCount: 4,
          productCount: 2,
          brands: [{ _id: 'b1', name: 'Merek A' }],
          photos: ['uploads/v1.jpg'],
          createdBy: {
            _id: 'u1',
            first_name: 'Budi',
            last_name: 'Santoso',
            email: 'budi@example.com',
          },
        },
      ],
    });

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: 'v1',
      name: 'Pemasok Satu',
      status: 'active',
      isOfficialDistributor: true,
      poCount: 4,
      productCount: 2,
      createdByName: 'Budi Santoso',
    });
    expect(list[0].brands).toEqual([{ id: 'b1', name: 'Merek A' }]);
    expect(getKolamVendorStatusLabel(list[0].status)).toBe('Aktif');
    expect(formatKolamVendorAddress(list[0])).toContain('Jakarta');

    const detail = normalizeKolamVendorDetail({
      data: {
        _id: 'v2',
        name: 'Pemasok Dua',
        status: 'blacklisted',
        bankName: 'BCA',
        bankAccountNumber: '123',
        link: ['https://example.com'],
        speciesCount: 3,
        packingCount: 1,
      },
    });
    expect(detail).toMatchObject({
      id: 'v2',
      status: 'blacklisted',
      bankName: 'BCA',
      speciesCount: 3,
      packingCount: 1,
    });
    expect(detail.links).toEqual(['https://example.com']);
    expect(getKolamVendorStatusLabel(detail.status)).toBe('Diblacklist');
  });

  it('flattens catalog product and species rows for detail tabs', () => {
    const vendor = normalizeKolamVendorDetail({
      data: {
        _id: 'sup1',
        name: 'Pemasok Katalog',
        products: [
          {
            _id: 'p1',
            name: 'Produk A',
            sku: 'SKU-A',
            type: 'product',
            price: 10000,
            brand: { _id: 'b1', name: 'Merek A' },
            photos: ['uploads/p1.jpg'],
            vendorPrices: [{ vendor: 'sup1', price: 9000, shippingCost: 0 }],
          },
          {
            _id: 'p2',
            name: 'Produk B',
            brand: [{ name: 'Merek B' }],
            variants: [
              {
                _id: 'v1',
                tier1Value: 'S',
                sku: 'B-S',
                vendorPrices: [
                  { vendor: { _id: 'sup1' }, price: 12000, shippingCost: 0 },
                ],
              },
              {
                _id: 'v2',
                tier1Value: 'L',
                sku: 'B-L',
                vendorPrices: [
                  { vendor: { _id: 'other' }, price: 15000, shippingCost: 0 },
                ],
              },
            ],
          },
        ],
        species: [
          {
            _id: 's1',
            scientificName: 'Rana sp.',
            commonName: 'Katak',
            productCode: 'SP-1',
            vendorPrices: [{ vendor: 'sup1', price: 5000 }],
          },
        ],
        packings: [
          {
            _id: 'pk1',
            name: 'Box Kecil',
            category: 'Box',
            price: 2000,
            cost: 1000,
            stock: 4,
          },
        ],
      },
    });

    expect(vendor.products).toHaveLength(2);
    expect(vendor.species).toHaveLength(1);
    expect(vendor.packings).toMatchObject([
      { id: 'pk1', name: 'Box Kecil', category: 'Box', stock: 4 },
    ]);

    const productRows = flattenKolamSupplierProductRows(
      vendor.products,
      vendor.id,
    );
    expect(productRows.map(row => row.key)).toEqual(['p1', 'p2', 'p2-v1']);
    expect(productRows[0]).toMatchObject({
      title: 'Produk A',
      code: 'SKU-A',
      brandLabel: 'Merek A',
      vendorPrice: 9000,
      isVariantRow: false,
    });
    expect(productRows[2]).toMatchObject({
      title: 'S',
      code: 'B-S',
      vendorPrice: 12000,
      isVariantRow: true,
    });

    const speciesRows = flattenKolamSupplierSpeciesRows(
      vendor.species,
      vendor.id,
    );
    expect(speciesRows).toHaveLength(1);
    expect(speciesRows[0]).toMatchObject({
      title: 'Rana sp.',
      commonName: 'Katak',
      code: 'SP-1',
      vendorPrice: 5000,
    });
  });

  it('keeps picker-safe defaults when optional fields missing', () => {
    const vendor = normalizeKolamVendor({
      _id: 'v3',
      name: 'Minimal',
    });
    expect(vendor).toMatchObject({
      id: 'v3',
      name: 'Minimal',
      email: '',
      phone: '',
      status: 'active',
      isOfficialDistributor: false,
      brands: [],
      products: [],
      species: [],
      packings: [],
      purchaseStatistics: null,
      photos: [],
      poCount: 0,
    });
  });

  it('normalizes purchase statistics and analytics query', () => {
    expect(buildKolamSupplierAnalyticsQuery({})).toEqual({
      filterType: undefined,
      year: undefined,
      month: undefined,
    });
    expect(
      buildKolamSupplierAnalyticsQuery({
        filterType: 'monthly',
        year: 2025,
        month: 3,
      }),
    ).toEqual({
      filterType: 'monthly',
      year: 2025,
      month: 3,
    });
    expect(
      buildKolamSupplierAnalyticsQuery({
        filterType: 'yearly',
        year: 2025,
        month: 3,
      }),
    ).toEqual({
      filterType: 'yearly',
      year: 2025,
      month: undefined,
    });

    const vendor = normalizeKolamVendorDetail({
      _id: 'sup1',
      name: 'Pemasok Analytics',
      purchaseStatistics: {
        filterApplied: { type: 'all_time', year: 2026, month: null },
        filteredStats: {
          overallStats: {
            totalOrders: 4,
            totalValue: 400000,
            averageOrderValue: 100000,
          },
          productPurchaseStats: [
            {
              _id: 'p1',
              productName: 'Produk A',
              productSku: 'A-1',
              totalQuantityOrdered: 10,
              totalQuantityReceived: 8,
              totalValue: 250000,
              averagePrice: 25000,
              orderCount: 2,
              lastPurchase: '2026-01-15T00:00:00.000Z',
            },
          ],
          summary: {
            totalProductTypes: 1,
            topProduct: {
              _id: 'p1',
              productName: 'Produk A',
              productSku: 'A-1',
              totalQuantityOrdered: 10,
              totalQuantityReceived: 8,
              totalValue: 250000,
              averagePrice: 25000,
              orderCount: 2,
              lastPurchase: '2026-01-15T00:00:00.000Z',
            },
            totalProductsWithPurchases: 1,
          },
        },
        yearlyAnalysis: {
          year: 2026,
          monthlyStatistics: [
            {
              month: 1,
              monthName: 'January',
              totalOrders: 2,
              totalValue: 200000,
              averageOrderValue: 100000,
            },
          ],
          summary: {
            totalOrdersThisYear: 4,
            totalValueThisYear: 400000,
            growthRate: 12.5,
          },
        },
      },
    });

    expect(hasKolamVendorPurchaseAnalytics(vendor.purchaseStatistics)).toBe(
      true,
    );
    expect(vendor.purchaseStatistics).toMatchObject({
      overall: {
        totalOrders: 4,
        totalValue: 400000,
        averageOrderValue: 100000,
      },
      summary: {
        totalProductTypes: 1,
        topProduct: { productName: 'Produk A', productSku: 'A-1' },
      },
      yearly: {
        year: 2026,
        totalOrdersThisYear: 4,
        growthRate: 12.5,
      },
    });
    expect(vendor.purchaseStatistics?.productStats).toHaveLength(1);
    expect(vendor.purchaseStatistics?.yearly.monthlyStatistics[0]).toMatchObject(
      {
        month: 1,
        totalOrders: 2,
      },
    );
  });
});
