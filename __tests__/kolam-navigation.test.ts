import {
  filterKolamNavigationSectionsByAccess,
  getKolamNavigationChromeContract,
  getKolamNavigationRouteCount,
  getKolamNavigationDisclosure,
  getKolamNavigationItemByRoute,
  getKolamNavigationItemByRuntimeRoute,
  getKolamNavigationLiveGroups,
  getKolamNavigationRouteVariants,
  getKolamNavigationRouteSurfaceContract,
  getKolamNavigationRouteTarget,
  kolamNavigationSections,
  kolamSidebarNavigationSections,
  orderKolamNavigationSections,
} from '../src/domain/kolam-navigation';

describe('kolamNavigationSections', () => {
  it('keeps the native sidebar aligned with the live Kolam menu sections', () => {
    expect(kolamNavigationSections.map(section => section.title)).toEqual([
      'Beranda',
      'Inventori',
      'Penjualan & Arus Kas',
      'Keuangan',
      'Pengguna',
      'Enclonura',
    ]);
    expect(getKolamNavigationRouteCount()).toBeGreaterThanOrEqual(78);
    expect(
      kolamNavigationSections
        .flatMap(section => section.items)
        .map(item => item.route),
    ).toEqual(
      expect.arrayContaining([
        '/',
        '/team-chat',
        '/notifications',
        '/pusat-ai',
        '/bantuan',
        '/label-dan-field/kategori',
        '/tags',
        '/custom-fields',
        '/custom-field-profiles',
        '/units',
        '/products',
        '/raw-materials',
        '/species',
        '/taxonomy',
        '/iucn-status',
        '/kontrol-layanan/pending-services',
        '/kontrol-layanan/active-tasks',
        '/layanan',
        '/stock-opname',
        '/locations',
        '/assets',
        '/packing-materials',
        '/media',
        '/suppliers',
        '/purchase-order',
        '/production',
        '/product-serials',
        '/enclosures',
        '/teranura',
        '/freyer',
        '/iot-freyer',
        '/sales',
        '/source',
        '/complaints',
        '/campaign/dara-marketing',
        '/campaign/dara-market-intel',
        '/campaign/dara-seo',
        '/sales/discount-approval',
        '/vouchers',
        '/metode-pengiriman',
        '/terms-templates',
        '/proyek',
        '/appointments',
        '/finance',
        '/finance/bonus',
        '/finance/payroll',
        '/finance/settings/tax-profile',
        '/finance/tax',
        '/wallet',
        '/asset-purchase',
        '/commissions',
        '/payable',
        '/receivable',
        '/routine-expenses',
        '/unexpected-expense',
        '/unexpected-income',
        '/payment-methods',
        '/customer-species',
        '/customer-storage',
        '/customer-storage-logs',
        '/enclonura-species',
        '/species-request',
        '/taxonomy-request',
        '/storage-management',
        '/storage-history',
        '/list-of-users/hr',
        '/list-of-users/overtime',
        '/staff-attendance',
        '/staff-attendance/leaves',
        '/staff-attendance/me',
        '/portal',
        '/task-manager',
      ]),
    );
  });

  it('filters live Kolam menu routes by native access scope', () => {
    const posRoutes = filterKolamNavigationSectionsByAccess(
      kolamNavigationSections,
      { kolam: false, pos: true, am: false },
    )
      .flatMap(section => section.items)
      .map(item => item.route);

    expect(posRoutes).toEqual(
      expect.arrayContaining([
        '/',
        '/products',
        '/species',
        '/sales',
        '/pos/cashflow',
        '/wallet',
        '/commissions',
        '/customers',
      ]),
    );
    expect(posRoutes).not.toContain('/settings/roles');
    expect(posRoutes).not.toContain('/raw-materials');
    expect(posRoutes).not.toContain('/custom-fields');
    expect(posRoutes).not.toContain('/assets');
    expect(posRoutes).not.toContain('/staff-attendance');
    expect(posRoutes).not.toContain('/stock-opname');
    expect(posRoutes).not.toContain('/complaints');
    expect(posRoutes).not.toContain('/vouchers');
    expect(posRoutes).not.toContain('/payment-methods');
    expect(posRoutes).not.toContain('/customer-species');

    const kolamRoutes = filterKolamNavigationSectionsByAccess(
      kolamNavigationSections,
      { kolam: true, pos: false, am: false },
    )
      .flatMap(section => section.items)
      .map(item => item.route);

    expect(kolamRoutes).not.toContain('/settings/activity-log');
    expect(kolamRoutes).toContain('/raw-materials');
    expect(kolamRoutes).toContain('/label-dan-field/kategori');
    expect(kolamRoutes).toContain('/custom-field-profiles');
    expect(kolamRoutes).toContain('/kontrol-layanan/pending-services');
    expect(kolamRoutes).toContain('/purchase-order');
    expect(kolamRoutes).toContain('/product-serials');
    expect(kolamRoutes).toContain('/source');
    expect(kolamRoutes).toContain('/complaints');
    expect(kolamRoutes).toContain('/sales/discount-approval');
    expect(kolamRoutes).toContain('/vouchers');
    expect(kolamRoutes).toContain('/metode-pengiriman');
    expect(kolamRoutes).toContain('/terms-templates');
    expect(kolamRoutes).toContain('/proyek');
    expect(kolamRoutes).not.toContain('/custom-project');
    expect(kolamRoutes).not.toContain('/custom-project/instances/new');
    expect(getKolamNavigationItemByRoute('/terms-templates')).toEqual(
      expect.objectContaining({
        label: 'Syarat & Ketentuan',
        route: '/terms-templates',
        group: 'Penjualan',
      }),
    );
    expect(getKolamNavigationItemByRoute('/custom-project')).toBeNull();
    expect(
      kolamSidebarNavigationSections
        .flatMap(section => section.items)
        .map(item => item.route),
    ).not.toContain('/custom-project');
    expect(
      kolamSidebarNavigationSections
        .flatMap(section => section.items)
        .some(
          item =>
            /custom project/i.test(item.label) ||
            /custom project/i.test(item.group ?? ''),
        ),
    ).toBe(false);
    expect(
      kolamSidebarNavigationSections
        .find(section => section.id === 'sales')
        ?.items.find(item => item.route === '/terms-templates'),
    ).toEqual(
      expect.objectContaining({
        label: 'Syarat & Ketentuan',
        group: 'Penjualan',
      }),
    );
    expect(
      kolamSidebarNavigationSections
        .find(section => section.id === 'sales')
        ?.items.find(item => item.route === '/layanan'),
    ).toEqual(
      expect.objectContaining({
        label: 'Layanan',
        group: 'Penjualan',
        route: '/layanan',
      }),
    );
    const sidebarPenjualanRoutes = kolamSidebarNavigationSections
      .find(section => section.id === 'sales')!
      .items.filter(item => item.group === 'Penjualan')
      .map(item => item.route);
    expect(sidebarPenjualanRoutes.indexOf('/layanan')).toBeGreaterThan(
      sidebarPenjualanRoutes.indexOf('/complaints'),
    );
    expect(sidebarPenjualanRoutes.indexOf('/layanan')).toBeLessThan(
      sidebarPenjualanRoutes.indexOf('/terms-templates'),
    );
    expect(kolamRoutes).toContain('/asset-purchase');
    expect(kolamRoutes).toContain('/commissions');
    expect(kolamRoutes).toContain('/routine-expenses');
    expect(kolamRoutes).toContain('/unexpected-expense');
    expect(kolamRoutes).toContain('/unexpected-income');
    expect(kolamRoutes).toContain('/payment-methods');
    expect(kolamRoutes).toContain('/finance/payroll');
    expect(kolamRoutes).toContain('/finance/settings/tax-profile');
    expect(kolamRoutes).toContain('/customer-species');
    expect(kolamRoutes).toContain('/customer-storage');
    expect(kolamRoutes).toContain('/customer-storage-logs');
    expect(kolamRoutes).toContain('/enclonura-species');
    expect(kolamRoutes).toContain('/storage-history');
    expect(kolamRoutes).not.toContain('/settings/ai-tools');
    expect(kolamRoutes).not.toContain(
      '/settings/websetting/marketplace-landing',
    );
    expect(kolamRoutes).toContain('/list-of-users/hr');
    expect(kolamRoutes).toContain('/staff-attendance/leaves');

    expect(
      filterKolamNavigationSectionsByAccess(kolamNavigationSections, {
        kolam: false,
        pos: false,
        am: false,
      }),
    ).toEqual([]);
  });

  it('supports native disclosure for dense live menu sections', () => {
    const inventory = kolamNavigationSections.find(
      section => section.id === 'inventory',
    );

    expect(inventory).toBeDefined();
    const collapsed = getKolamNavigationDisclosure(inventory!, false);
    const expanded = getKolamNavigationDisclosure(inventory!, true);

    expect(collapsed.visibleItems.map(item => item.route)).toEqual([
      '/brands',
      '/label-dan-field/kategori',
    ]);
    expect(collapsed.hiddenCount).toBeGreaterThan(0);
    expect(collapsed.countLabel).toBe(`2/${inventory!.items.length}`);
    expect(expanded.visibleItems).toHaveLength(inventory!.items.length);
    expect(expanded.hiddenCount).toBe(0);
    expect(expanded.countLabel).toBe(String(inventory!.items.length));
  });

  it('tracks live dropdown groups inside dense native sections', () => {
    const byId = (sectionId: string) => {
      const section = kolamNavigationSections.find(
        item => item.id === sectionId,
      );
      if (!section) {
        throw new Error(`Expected section ${sectionId}`);
      }
      return section;
    };

    expect(getKolamNavigationLiveGroups(byId('inventory'))).toEqual([
      'Label dan Field',
      'Produk',
      'Stok Hidup',
      'Layanan',
      'Stok',
      'Inventory',
      'Pengadaan',
      'Produksi',
    ]);
    expect(getKolamNavigationLiveGroups(byId('finance'))).toEqual([
      'Payroll & Tax',
      'Pengeluaran & Pemasukan',
      'Pengaturan Keuangan',
    ]);
    expect(kolamNavigationSections.some(section => section.id === 'settings')).toBe(
      false,
    );
  });

  it('keeps native icon chrome for disclosure and section reorder controls', () => {
    expect(getKolamNavigationChromeContract()).toEqual({
      disclosureCollapsedIconKind: 'chevron-right',
      disclosureExpandedIconKind: 'chevron-down',
      activeState: {
        background: 'primary/10',
        resolvedBackground: '#e8f6ed',
        foreground: 'primary',
        iconFill: 'primary/20',
      },
      reorderActions: [
        {
          id: 'move-up',
          label: 'Move section up',
          iconKind: 'chevron-up',
        },
        {
          id: 'move-down',
          label: 'Move section down',
          iconKind: 'chevron-down',
        },
      ],
      sourceComponent:
        'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\components\\app-sidebar.tsx',
    });
  });

  it('maps live menu routes to the closest native module', () => {
    const items = kolamNavigationSections.flatMap(section => section.items);
    const byRoute = (route: string) => {
      const item = items.find(candidate => candidate.route === route);
      if (!item) {
        throw new Error(`Expected route ${route} in Kolam navigation`);
      }
      return item;
    };

    expect(getKolamNavigationRouteTarget(byRoute('/products')).moduleId).toBe(
      'kolam',
    );
    expect(
      getKolamNavigationRouteTarget(byRoute('/label-dan-field/kategori'))
        .moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/purchase-order')).moduleId,
    ).toBe('kolam');
    expect(getKolamNavigationRouteTarget(byRoute('/species')).moduleId).toBe(
      'kolam',
    );
    expect(getKolamNavigationRouteTarget(byRoute('/sales')).moduleId).toBe(
      'kolam',
    );
    expect(
      getKolamNavigationRouteTarget(byRoute('/cashflow-session')).moduleId,
    ).toBe('kolam');
    expect(getKolamNavigationRouteTarget(byRoute('/source')).moduleId).toBe(
      'kolam',
    );
    expect(
      getKolamNavigationRouteTarget(byRoute('/sales/discount-approval'))
        .moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/terms-templates')).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/payment-methods')).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/finance/payroll')).moduleId,
    ).toBe('kolam');
    expect(getKolamNavigationRouteTarget(byRoute('/customers')).moduleId).toBe(
      'kolam',
    );
    expect(
      getKolamNavigationRouteTarget(byRoute('/customer-species')).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/enclonura-species')).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/storage-management')).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget({
        description: 'Log aktivitas sistem.',
        label: 'Activity Log',
        requiredAccess: ['kolam'],
        route: '/settings/activity-log',
      }).moduleId,
    ).toBe('settings');
  });

  it('finds live menu items by route for native route surfaces', () => {
    expect(getKolamNavigationItemByRoute('/brands')).toEqual(
      expect.objectContaining({
        label: 'Merek',
        route: '/brands',
      }),
    );
    expect(getKolamNavigationItemByRoute('/settings/activity-log')).toBeNull();
    expect(getKolamNavigationItemByRoute('/missing-route')).toBeNull();
  });

  it('uses FE DARA Market Intel shell titles and descriptions', () => {
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-market-intel'),
    ).toEqual(
      expect.objectContaining({
        label: 'DARA AI Market Intelligence',
        description:
          'Monitor harga & supplier, rekomendasi pricing/pembelian. Semua saran butuh approval — terapkan harga manual di produk setelah disetujui.',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute(
        '/campaign/dara-market-intel/approvals',
      ),
    ).toEqual(
      expect.objectContaining({
        label: 'Persetujuan Market Intelligence',
        description:
          'Review dan setujui rekomendasi pricing/pembelian — harga diterapkan manual di produk.',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute(
        '/campaign/dara-market-intel/competitors',
      ),
    ).toEqual(
      expect.objectContaining({
        label: 'Monitor kompetitor',
      }),
    );
  });

  it('uses FE DARA SEO shell titles and descriptions', () => {
    expect(getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo')).toEqual(
      expect.objectContaining({
        label: 'DARA SEO & Market Intelligence',
        description:
          'Analisa, rekomendasi, dan draft perubahan. Mutasi produk hanya setelah approval.',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo/approvals'),
    ).toEqual(
      expect.objectContaining({
        label: 'Persetujuan Perubahan SEO',
        description:
          'Review draft AI untuk produk, blog, dan livestock — lalu terapkan setelah approve.',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo/keywords'),
    ).toEqual(
      expect.objectContaining({
        label: 'Keyword Opportunities',
        description:
          'Peluang keyword dari audit DARA SEO — prioritas berdasarkan skor peluang.',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo/sentiment'),
    ).toEqual(
      expect.objectContaining({
        label: 'Analisis Sentimen',
        description:
          'Analisis sentimen teks review — rule-based atau Llama (AI).',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo/integrations'),
    ).toEqual(
      expect.objectContaining({
        label: 'Integrasi sumber SEO',
        description:
          'SerpAPI, DuckDuckGo, SearXNG, GSC, Firecrawl, dan Indexing API — atur tanpa edit .env.',
      }),
    );
  });

  it('indexes live create detail and edit route variants for native command search', () => {
    const variants = getKolamNavigationRouteVariants();

    expect(variants).toHaveLength(166);
    expect(variants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseRoute: '/products',
          label: 'Produk Baru',
          description: 'Tambahkan produk baru ke katalog.',
          moduleIcon: 'product',
          route: '/products/create',
          routePattern: '/products/create',
        }),
        expect.objectContaining({
          baseRoute: '/products',
          label: 'Edit Produk',
          description: 'Ubah informasi, harga, stok, dan keterangan produk.',
          moduleIcon: 'product',
          route: '/products/:id/edit',
          routePattern: '/products/:id/edit',
        }),
        expect.objectContaining({
          baseRoute: '/sales',
          route: '/sales/create',
        }),
        expect.objectContaining({
          baseRoute: '/cashflow-session',
          route: '/cashflow-session/:id',
        }),
        expect.objectContaining({
          baseRoute: '/asset-purchase',
          label: 'Buat Pembelian Aset',
          route: '/asset-purchase/create',
          description: 'Buat pembelian aset',
        }),
        expect.objectContaining({
          baseRoute: '/unexpected-expense',
          label: 'Pengeluaran Tak Terduga Baru',
          route: '/unexpected-expense/create',
          description: 'Catat pengeluaran tak terduga',
        }),
        expect.objectContaining({
          baseRoute: '/unexpected-income',
          label: 'Pemasukan Tak Terduga Baru',
          route: '/unexpected-income/create',
          description: 'Catat pemasukan tak terduga',
        }),
        expect.objectContaining({
          baseRoute: '/customers',
          route: '/customers/:id/edit',
        }),
        expect.objectContaining({
          baseRoute: '/purchase-order',
          route: '/purchase-order/:id/edit',
        }),
        expect.objectContaining({
          baseRoute: '/campaign/dara-seo',
          route: '/campaign/dara-seo/keywords',
        }),
        expect.objectContaining({
          baseRoute: '/task-manager',
          route: '/task-manager/tugas-terjadwal',
        }),
        expect.objectContaining({
          baseRoute: '/teranura',
          route: '/teranura/:id/statistics',
        }),
        expect.objectContaining({
          baseRoute: '/finance/payroll',
          route: '/finance/payroll/slip/:slipId',
        }),
      ]),
    );
    expect(
      getKolamNavigationRouteTarget(
        variants.find(variant => variant.route === '/products/create')!,
      ).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(
        variants.find(variant => variant.route === '/sales/create')!,
      ).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(
        variants.find(variant => variant.route === '/customers/:id/edit')!,
      ).moduleId,
    ).toBe('kolam');
  });

  it('labels stock transaction detail as Detil Transaksi Stok', () => {
    const detail = getKolamNavigationRouteVariants().find(
      variant => variant.route === '/stock-transaction/:id',
    );
    expect(detail).toEqual(
      expect.objectContaining({
        baseRoute: '/stock-transaction',
        label: 'Detil Transaksi Stok',
        description:
          'Rincian pergerakan stok, target, dan status sinkron marketplace',
        route: '/stock-transaction/:id',
        routePattern: '/stock-transaction/:id',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/stock-transaction/abc123'),
    ).toEqual(
      expect.objectContaining({
        label: 'Detil Transaksi Stok',
        description:
          'Rincian pergerakan stok, target, dan status sinkron marketplace',
        route: '/stock-transaction/abc123',
        routePattern: '/stock-transaction/:id',
      }),
    );
  });

  it('resolves dashboard runtime routes to live menu route context', () => {
    expect(
      getKolamNavigationItemByRuntimeRoute('/products?stockStatus=low_stock'),
    ).toEqual(
      expect.objectContaining({
        label: 'Produk',
        route: '/products?stockStatus=low_stock',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/products/create')).toEqual(
      expect.objectContaining({
        label: 'Produk Baru',
        moduleIcon: 'product',
        route: '/products/create',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/sales/create')).toEqual(
      expect.objectContaining({
        label: 'Penjualan Baru',
        route: '/sales/create',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/sales/sale-1/edit')).toEqual(
      expect.objectContaining({
        label: 'Ubah Penjualan',
        route: '/sales/sale-1/edit',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo/keywords'),
    ).toEqual(
      expect.objectContaining({
        label: 'Keyword Opportunities',
        description:
          'Peluang keyword dari audit DARA SEO — prioritas berdasarkan skor peluang.',
        route: '/campaign/dara-seo/keywords',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo'),
    ).toEqual(
      expect.objectContaining({
        label: 'DARA SEO & Market Intelligence',
        description:
          'Analisa, rekomendasi, dan draft perubahan. Mutasi produk hanya setelah approval.',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo/approvals'),
    ).toEqual(
      expect.objectContaining({
        label: 'Persetujuan Perubahan SEO',
        description:
          'Review draft AI untuk produk, blog, dan livestock — lalu terapkan setelah approve.',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/finance/payroll/slip/slip-1'),
    ).toEqual(
      expect.objectContaining({
        label: 'Penggajian Slip',
        route: '/finance/payroll/slip/slip-1',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/sales/sale-1')).toEqual(
      expect.objectContaining({
        label: 'Detail Penjualan',
        route: '/sales/sale-1',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/inventory')).toEqual(
      expect.objectContaining({
        label: 'Inventory',
        route: '/inventory',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/layanan')).toEqual(
      expect.objectContaining({
        label: 'Layanan',
        route: '/layanan',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/label-dan-field/merek'),
    ).toEqual(
      expect.objectContaining({
        group: 'Label dan Field',
        label: 'Merek',
        route: '/label-dan-field/merek',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute(
        '/label-dan-field/merek/Dunia%20Anura/edit',
      ),
    ).toEqual(
      expect.objectContaining({
        group: 'Label dan Field',
        label: 'Dunia Anura',
        route: '/label-dan-field/merek/Dunia%20Anura/edit',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/label-dan-field/merek/baru'),
    ).toEqual(
      expect.objectContaining({
        group: 'Label dan Field',
        label: 'Buat Merek Baru',
        route: '/label-dan-field/merek/baru',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/label-dan-field/kategori'),
    ).toEqual(
      expect.objectContaining({
        group: 'Label dan Field',
        label: 'Kategori',
        route: '/label-dan-field/kategori',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/category')).toEqual(
      expect.objectContaining({
        group: 'Label dan Field',
        label: 'Kategori',
        route: '/label-dan-field/kategori',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute(
        '/label-dan-field/kategori/Peralatan/edit',
      ),
    ).toEqual(
      expect.objectContaining({
        group: 'Label dan Field',
        label: 'Peralatan',
        route: '/label-dan-field/kategori/Peralatan/edit',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/label-dan-field/kategori/baru'),
    ).toEqual(
      expect.objectContaining({
        group: 'Label dan Field',
        label: 'Buat Kategori Baru',
        route: '/label-dan-field/kategori/baru',
      }),
    );
  });

  it('describes native route surfaces using live route coverage metadata', () => {
    const productCreate =
      getKolamNavigationItemByRuntimeRoute('/products/create');
    const productEdit = getKolamNavigationItemByRuntimeRoute(
      '/products/product-live-low/edit',
    );
    const inventory = getKolamNavigationItemByRuntimeRoute('/inventory');

    if (!productCreate || !productEdit || !inventory) {
      throw new Error('Expected route contexts to resolve.');
    }

    expect(getKolamNavigationRouteSurfaceContract(productCreate)).toEqual(
      expect.objectContaining({
        baseRoute: '/products',
        routeKind: 'live-route-variant',
        routePattern: '/products/create',
        runtimeRoute: '/products/create',
        sourceRepo: 'E:\\Projects\\_latest-da\\da-inventory-frontend',
        coverageEvidence: 'npm run verify:live-routes',
      }),
    );
    expect(getKolamNavigationRouteSurfaceContract(productEdit)).toEqual(
      expect.objectContaining({
        baseRoute: '/products',
        routeKind: 'live-route-variant',
        routePattern: '/products/:id/edit',
        runtimeRoute: '/products/product-live-low/edit',
      }),
    );
    expect(getKolamNavigationRouteSurfaceContract(inventory)).toEqual(
      expect.objectContaining({
        baseRoute: '/inventory',
        routeKind: 'runtime-context',
        sourceRepo: 'E:\\Data\\Dunia-Anura\\KolamWindows',
      }),
    );
  });

  it('orders native Kolam menu sections without losing new live sections', () => {
    const ordered = orderKolamNavigationSections(kolamNavigationSections, [
      'settings',
      'overview',
      'inventory',
    ]);

    expect(ordered.map(section => section.id).slice(0, 3)).toEqual([
      'overview',
      'inventory',
      'sales',
    ]);
    expect(ordered.map(section => section.id)).toEqual(
      expect.arrayContaining(['sales', 'finance', 'user', 'enclonura']),
    );
    expect(ordered).toHaveLength(kolamNavigationSections.length);
  });

  it('removes the compact Settings sidebar entry because Settings lives in top modules', () => {
    const settingsSection = kolamSidebarNavigationSections.find(
      section => section.id === 'settings',
    );

    expect(settingsSection).toBeUndefined();
  });
});
