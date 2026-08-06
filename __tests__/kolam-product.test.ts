import {
  createKolamProductFormState,
  createKolamProductSavePayload,
  getKolamProductBreadcrumbPath,
  normalizeKolamProductDetail,
} from '../src/domain/kolam-product';

describe('Kolam product domain contract', () => {
  it('normalizes detail payload fields used by the native product detail view', () => {
    const product = normalizeKolamProductDetail({
      data: {
        _id: 'product-1',
        name: 'Filter Canister',
        slug: 'filter-canister',
        sku: 'FLT-001',
        shortDescription: 'Filter eksternal',
        description: '<p>Media filter lengkap</p>',
        photos: ['media/products/filter.jpg'],
        videos: ['media/products/filter.mp4'],
        categories: [{ _id: 'cat-1', name: 'Filter' }],
        brands: [{ _id: 'brand-1', name: 'Kolam Pro' }],
        labels: ['Best seller'],
        tags: [{ _id: 'tag-1', name: 'Canister' }],
        location: {
          name: 'Rak 1',
          parent: { name: 'Gudang A', parent: { name: 'HQ' } },
        },
        translations: {
          en: {
            name: 'Canister Filter',
            shortDescription: 'External filter',
            description: '<p>Complete filter media</p>',
          },
        },
        price: 250000,
        priceToSell: 325000,
        marketPrice: 350000,
        onlinePrice: 330000,
        minimum_price_to_sales: 300000,
        minimumOrderQty: 2,
        memberPoints: { enabled: true, points: 25 },
        commissionEnabled: true,
        commissionType: 'percentage',
        commissionValue: 5,
        grocerPricingTiers: [{ minQty: 12, price: 300000, onlinePrice: 310000 }],
        vendorPrices: [{ price: 200000 }, { totalCost: 225000 }],
        stock: 4,
        lowStockThreshold: 5,
        unit: { name: 'pcs' },
        weight: { value: 1200, unit: { initial: 'g' } },
        dimension: { length: 35, width: 20, height: 18, unit: { initial: 'cm' } },
        link: [{ name: 'website', value: 'https://example.com/filter-canister' }],
        customFieldValues: [
          {
            field: {
              _id: 'field-1',
              fieldLabel: 'Daya pompa',
              fieldType: 'number',
              description: 'Flow rate',
              required: true,
            },
            value: 750,
            unit: { initial: 'L/H' },
          },
        ],
        packings: [
          {
            packing: { _id: 'pack-1', name: 'Box Filter', sku: 'BOX-001' },
            quantity: 1,
          },
        ],
        availableShippingMethods: [
          {
            _id: 'ship-1',
            displayName: 'Kurir Reguler',
            category: 'regular',
            pricingModel: { type: 'per_kg', price: 12000 },
            estimatedDays: { min: 2, max: 4 },
          },
        ],
        productWarranty: {
          mode: 'da',
          warrantyDays: 30,
          warrantyTermsTemplate: { title: 'Garansi Filter' },
        },
        seo: {
          metaTitle: 'Filter Canister',
          metaDescription: 'Filter aquarium',
          keywords: ['filter', 'aquarium'],
          faq: [{ question: 'Aman?', answer: 'Ya' }],
          lastSeoScore: 88,
        },
        assets: [
          {
            _id: 'asset-1',
            title: 'Manual',
            originalFilename: 'manual.pdf',
            fileSize: 2048,
            mimeType: 'application/pdf',
          },
        ],
        marketplaceSync: {
          tokopedia: {
            status: 'partial',
            lastSyncedAt: '2026-07-20T08:00:00.000Z',
            variantResults: [{ id: 'v1' }],
          },
        },
        marketplacePriceSync: {
          shopee: {
            status: 'synced',
            lastSyncedAt: '2026-07-21T08:00:00.000Z',
          },
        },
        variants: [
          {
            _id: 'variant-1',
            tier1Value: '750 L/H',
            sku: 'FLT-001-750',
            price: 210000,
            priceToSell: 325000,
            minimum_price_to_sales: 300000,
            minimumOrderQty: 2,
            onlinePrice: 330000,
            marketPrice: 350000,
            memberPoints: { enabled: true, points: 12 },
            commissionEnabled: true,
            commissionType: 'percentage',
            commissionValue: 4,
            grocerPricingTiers: [{ minQty: 6, price: 310000, onlinePrice: 320000 }],
            vendorPrices: [
              {
                _id: 'variant-vendor-1',
                vendor: { _id: 'vendor-variant-1', name: 'Supplier Varian', status: 'active' },
                price: 210000,
                shippingCost: 15000,
                totalCost: 225000,
                link: 'https://supplier.test/filter-750',
                priceHistory: [{ poRef: 'PO-001', poId: 'po-1', date: '2026-07-22T08:00:00.000Z' }],
              },
            ],
            stock: 2,
            photos: ['media/products/filter-750.jpg'],
            videos: ['media/products/filter-750.mp4'],
            link: [{ name: 'tokopedia', value: 'https://tokopedia.test/filter' }],
          },
        ],
      },
    });

    expect(product).toEqual(
      expect.objectContaining({
        id: 'product-1',
        name: 'Filter Canister',
        thumbnailUri:
          'https://amfibi.dunia-anura.com/media/products/filter.jpg',
        shortDescription: 'Filter eksternal',
        description: '<p>Media filter lengkap</p>',
        unitLabel: 'pcs',
        stock: 4,
        lowStockThreshold: 5,
        locationLabel: 'HQ > Gudang A > Rak 1',
        minimumOrderQty: 2,
        minimumPriceToSales: 300000,
        vendorPriceRangeLabel: 'Rp 200.000 - Rp 225.000',
      }),
    );
    expect(product.logistics).toEqual(
      expect.objectContaining({
        height: 18,
        length: 35,
        weight: 1200,
        width: 20,
      }),
    );
    expect(product.externalLinks).toEqual([
      { label: 'website', url: 'https://example.com/filter-canister' },
    ]);
    expect(product.localeBlocks).toEqual([
      expect.objectContaining({ locale: 'id', name: 'Filter Canister' }),
      expect.objectContaining({ locale: 'en', name: 'Canister Filter' }),
    ]);
    expect(product.tags).toEqual([expect.objectContaining({ name: 'Canister' })]);
    expect(product.customFields).toEqual([
      expect.objectContaining({
        label: 'Daya pompa',
        required: true,
        value: '750 L/H',
      }),
    ]);
    expect(product.packings).toEqual([
      expect.objectContaining({ name: 'Box Filter', quantity: 1 }),
    ]);
    expect(product.logistics.shippingMethods).toEqual([
      expect.objectContaining({
        label: 'Kurir Reguler',
        priceLabel: 'Rp 12.000/kg',
      }),
    ]);
    expect(product.warranty).toEqual(
      expect.objectContaining({ label: 'Garansi DA', days: 30 }),
    );
    expect(product.seo).toEqual(
      expect.objectContaining({
        faqCount: 1,
        keywords: ['filter', 'aquarium'],
        lastSeoScore: 88,
      }),
    );
    expect(product.assets).toEqual([
      expect.objectContaining({ title: 'Manual', filename: 'manual.pdf' }),
    ]);
    expect(product.variants[0]).toEqual(
      expect.objectContaining({
        label: '750 L/H',
        photoUris: [
          'https://amfibi.dunia-anura.com/media/products/filter-750.jpg',
        ],
        vendorPrices: [
          expect.objectContaining({
            price: 210000,
            shippingCost: 15000,
            totalCost: 225000,
            vendorName: 'Supplier Varian',
          }),
        ],
        minimumOrderQty: 2,
        minimumPriceToSales: 300000,
        grocerPricingTiers: [expect.objectContaining({ minQty: 6 })],
        memberPoints: { enabled: true, points: 12 },
        commissionEnabled: true,
        commissionType: 'percentage',
        commissionValue: 4,
        videoUris: [
          'https://amfibi.dunia-anura.com/media/products/filter-750.mp4',
        ],
      }),
    );
    expect(product.marketplaceSync.platforms[0]).toEqual(
      expect.objectContaining({
        label: 'Tokopedia',
        status: 'partial',
        variantCount: 1,
      }),
    );
    expect(product.marketplaceSync.pricePlatforms[0]).toEqual(
      expect.objectContaining({
        label: 'Shopee',
        status: 'synced',
      }),
    );
  });

  it('builds edit form state and save payload following the FE product edit contract', () => {
    const product = normalizeKolamProductDetail({
      data: {
        _id: 'product-1',
        name: 'Filter Canister',
        sku: 'FLT-001',
        productCode: 'RAW-001',
        type: 'product',
        shortDescription: 'Filter eksternal',
        description: '<p>Media filter lengkap</p>',
        brand: [{ _id: 'brand-1', name: 'Kolam Pro' }],
        category: [{ _id: 'cat-1', name: 'Filter' }],
        tags: [{ _id: 'tag-1', name: 'Canister' }],
        units: { _id: 'unit-1', initial: 'pcs' },
        location: { _id: 'loc-1', name: 'Rak 1' },
        availableShippingMethods: [{ _id: 'ship-1', displayName: 'Reguler' }],
        translations: {
          en: {
            name: 'Canister Filter',
            shortDescription: 'External filter',
            description: '<p>Complete filter media</p>',
          },
        },
        price_to_sell: 325000,
        marketPrice: 350000,
        onlinePrice: 330000,
        minimum_price_to_sales: 300000,
        minimumOrderQty: 2,
        lowStockThreshold: 5,
        sellable: true,
        weight: { value: 1200, unit: { _id: 'gram' } },
        dimension: { length: 35, width: 20, height: 18, unit: { _id: 'cm' } },
        commissionEnabled: true,
        commissionType: 'percentage',
        commissionValue: 5,
        memberPoints: { enabled: true, points: 25 },
        productWarranty: {
          mode: 'da',
          warrantyDays: 30,
          warrantyTermsTemplate: { _id: 'terms-1', title: 'Garansi Filter' },
        },
        grocerPricingTiers: [{ minQty: 12, price: 300000, onlinePrice: 310000 }],
        vendorPrices: [
          {
            _id: 'vendor-price-1',
            vendor: { _id: 'vendor-1', name: 'Supplier A' },
            price: 200000,
            shippingCost: 25000,
            link: 'https://supplier.test/filter',
          },
        ],
        components: [
          {
            _id: 'component-1',
            product: { _id: 'raw-1', name: 'Media Filter' },
            quantity: 2,
          },
        ],
        link: [{ name: 'website', value: 'https://example.com/filter-canister' }],
        packings: [
          {
            _id: 'packing-link-1',
            packing: { _id: 'pack-1', name: 'Box Filter' },
            quantity: 1,
          },
        ],
      },
    });

    const form = createKolamProductFormState(product);
    expect(form).toEqual(
      expect.objectContaining({
        id: 'product-1',
        brandIds: ['brand-1'],
        categoryIds: ['cat-1'],
        tagIds: ['tag-1'],
        unitId: 'unit-1',
        locationId: 'loc-1',
        availableShippingMethodIds: ['ship-1'],
        warrantyTermsTemplateId: 'terms-1',
      }),
    );

    const payload = createKolamProductSavePayload(form);
    expect(payload).toEqual(
      expect.objectContaining({
        name: 'Filter Canister',
        sku: 'FLT-001',
        productCode: '-',
        type: 'product',
        brand: ['brand-1'],
        category: ['cat-1'],
        unit: 'unit-1',
        location: 'loc-1',
        availableShippingMethods: ['ship-1'],
        price_to_sell: 325000,
        minimum_price_to_sales: 300000,
        minimumOrderQty: 2,
        tags: ['tag-1'],
      }),
    );
    expect(payload).toEqual(
      expect.objectContaining({
        link: [{ name: 'website', value: 'https://example.com/filter-canister' }],
        vendorPrices: [
          {
            vendor: 'vendor-1',
            price: 200000,
            shippingCost: 25000,
            link: 'https://supplier.test/filter',
          },
        ],
        components: [{ product: 'raw-1', quantity: 2, totalWeight: null }],
        weight: { value: 1200, unit: 'gram' },
        dimension: { length: 35, width: 20, height: 18, unit: 'cm' },
        memberPoints: { enabled: true, points: 25 },
        productWarranty: {
          mode: 'da',
          warrantyDays: 30,
          warrantyVendor: null,
          warrantyTermsTemplate: 'terms-1',
        },
      }),
    );
  });

  it('uses product id for product detail breadcrumb paths even when a slug exists', () => {
    const product = normalizeKolamProductDetail({
      data: {
        _id: '689a4ca70bb4670565ac062d',
        name: 'Frog Soil',
        slug: 'frog-soil',
        sku: 'FRG-001',
      },
    });

    expect(getKolamProductBreadcrumbPath('detail', product, 'product')).toBe(
      '/products/689a4ca70bb4670565ac062d',
    );
    expect(getKolamProductBreadcrumbPath('edit', product, 'product')).toBe(
      '/products/689a4ca70bb4670565ac062d/edit',
    );
  });
});
