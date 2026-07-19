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
      'Overview',
      'Inventory',
      'Sales & Cashflow',
      'Finance',
      'User',
      'Enclonura',
      'Settings',
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
        '/campaign/dara-jobs',
        '/campaign/dara-marketing',
        '/campaign/dara-market-intel',
        '/campaign/dara-seo',
        '/sales/discount-approval',
        '/vouchers',
        '/shipping-method',
        '/custom-project',
        '/custom-project/instances/new',
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
        '/settings/sitemap',
        '/blogs',
        '/blog-topics',
        '/settings/activity-log',
        '/settings/ai-tools',
        '/settings/alerts',
        '/settings/maintenance',
        '/settings/syncs',
        '/settings/system',
        '/settings/tax',
        '/settings/websetting/marketplace-landing',
        '/list-of-users/hr',
        '/list-of-users/overtime',
        '/staff-attendance',
        '/staff-attendance/leaves',
        '/staff-attendance/me',
        '/portal',
        '/task-manager',
        '/settings',
        '/web-settings',
        '/app-downloads',
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
        '/cashflow-session',
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

    expect(kolamRoutes).toContain('/settings/activity-log');
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
    expect(kolamRoutes).toContain('/shipping-method');
    expect(kolamRoutes).toContain('/custom-project/instances/new');
    expect(kolamRoutes).toContain('/terms-templates');
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
    expect(kolamRoutes).toContain('/settings/sitemap');
    expect(kolamRoutes).toContain('/blogs');
    expect(kolamRoutes).toContain('/blog-topics');
    expect(kolamRoutes).toContain('/settings/ai-tools');
    expect(kolamRoutes).toContain('/settings/websetting/marketplace-landing');
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
      'Label and Fields',
      'Products',
      'Life Stocks',
      'Services',
      'Stock',
      'Procurement',
      'Productions',
    ]);
    expect(getKolamNavigationLiveGroups(byId('finance'))).toEqual([
      'Payroll & Tax',
      'Expenses & Income',
      'Finance Settings',
    ]);
    expect(getKolamNavigationLiveGroups(byId('settings'))).toEqual([
      'Web',
      'System',
    ]);
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
      'catalog',
    );
    expect(
      getKolamNavigationRouteTarget(byRoute('/label-dan-field/kategori'))
        .moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/purchase-order')).moduleId,
    ).toBe('kolam');
    expect(getKolamNavigationRouteTarget(byRoute('/species')).moduleId).toBe(
      'catalog',
    );
    expect(getKolamNavigationRouteTarget(byRoute('/sales')).moduleId).toBe(
      'sales',
    );
    expect(
      getKolamNavigationRouteTarget(byRoute('/cashflow-session')).moduleId,
    ).toBe('cashflow');
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
      'customer',
    );
    expect(
      getKolamNavigationRouteTarget(byRoute('/customer-species')).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/settings/activity-log')).moduleId,
    ).toBe('settings');
    expect(
      getKolamNavigationRouteTarget(byRoute('/settings/ai-tools')).moduleId,
    ).toBe('settings');
    expect(
      getKolamNavigationRouteTarget(byRoute('/settings/sitemap')).moduleId,
    ).toBe('settings');
    expect(getKolamNavigationRouteTarget(byRoute('/blogs')).moduleId).toBe(
      'kolam',
    );
    expect(
      getKolamNavigationRouteTarget(byRoute('/enclonura-species')).moduleId,
    ).toBe('kolam');
    expect(
      getKolamNavigationRouteTarget(byRoute('/storage-management')).moduleId,
    ).toBe('kolam');
  });

  it('finds live menu items by route for native route surfaces', () => {
    expect(getKolamNavigationItemByRoute('/brands')).toEqual(
      expect.objectContaining({
        label: 'Brands',
        route: '/brands',
      }),
    );
    expect(getKolamNavigationItemByRoute('/settings/activity-log')).toEqual(
      expect.objectContaining({
        label: 'Activity Log',
        route: '/settings/activity-log',
      }),
    );
    expect(getKolamNavigationItemByRoute('/missing-route')).toBeNull();
  });

  it('indexes live create detail and edit route variants for native command search', () => {
    const variants = getKolamNavigationRouteVariants();

    expect(variants).toHaveLength(168);
    expect(variants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          baseRoute: '/products',
          label: 'Products Create',
          route: '/products/create',
          routePattern: '/products/create',
        }),
        expect.objectContaining({
          baseRoute: '/products',
          label: 'Products Edit',
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
          route: '/asset-purchase/create',
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
          baseRoute: '/blogs',
          route: '/blogs/create',
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
    ).toBe('catalog');
    expect(
      getKolamNavigationRouteTarget(
        variants.find(variant => variant.route === '/sales/create')!,
      ).moduleId,
    ).toBe('sales');
    expect(
      getKolamNavigationRouteTarget(
        variants.find(variant => variant.route === '/customers/:id/edit')!,
      ).moduleId,
    ).toBe('customer');
  });

  it('resolves dashboard runtime routes to live menu route context', () => {
    expect(
      getKolamNavigationItemByRuntimeRoute('/products?stockStatus=low_stock'),
    ).toEqual(
      expect.objectContaining({
        label: 'Products',
        route: '/products?stockStatus=low_stock',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/products/create')).toEqual(
      expect.objectContaining({
        label: 'Products Create',
        route: '/products/create',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/sales/create')).toEqual(
      expect.objectContaining({
        label: 'Sales Create',
        route: '/sales/create',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/sales/sale-1/edit')).toEqual(
      expect.objectContaining({
        label: 'Sales Edit',
        route: '/sales/sale-1/edit',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/campaign/dara-seo/keywords'),
    ).toEqual(
      expect.objectContaining({
        label: 'DARA SEO Keywords',
        route: '/campaign/dara-seo/keywords',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/finance/payroll/slip/slip-1'),
    ).toEqual(
      expect.objectContaining({
        label: 'Payroll Slip',
        route: '/finance/payroll/slip/slip-1',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/sales/sale-1')).toEqual(
      expect.objectContaining({
        label: 'Sales Detail',
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
        group: 'Label and Fields',
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
        group: 'Label and Fields',
        label: 'Dunia Anura',
        route: '/label-dan-field/merek/Dunia%20Anura/edit',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/label-dan-field/merek/baru'),
    ).toEqual(
      expect.objectContaining({
        group: 'Label and Fields',
        label: 'Buat Merek Baru',
        route: '/label-dan-field/merek/baru',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/label-dan-field/kategori'),
    ).toEqual(
      expect.objectContaining({
        group: 'Label and Fields',
        label: 'Kategori',
        route: '/label-dan-field/kategori',
      }),
    );
    expect(getKolamNavigationItemByRuntimeRoute('/category')).toEqual(
      expect.objectContaining({
        group: 'Label and Fields',
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
        group: 'Label and Fields',
        label: 'Peralatan',
        route: '/label-dan-field/kategori/Peralatan/edit',
      }),
    );
    expect(
      getKolamNavigationItemByRuntimeRoute('/label-dan-field/kategori/baru'),
    ).toEqual(
      expect.objectContaining({
        group: 'Label and Fields',
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
      'settings',
      'overview',
      'inventory',
    ]);
    expect(ordered.map(section => section.id)).toEqual(
      expect.arrayContaining(['sales', 'finance', 'user', 'enclonura']),
    );
    expect(ordered).toHaveLength(kolamNavigationSections.length);
  });
});
