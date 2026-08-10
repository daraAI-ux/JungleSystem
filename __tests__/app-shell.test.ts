import {
  getSidebarBrand,
  getShellAreaCoverage,
  getShellModule,
  getShellModuleRouteEntry,
  getShellModuleRouteIndex,
  getShellModulesByArea,
  sidebarBrand,
  shellModules,
} from '../src/domain/app-shell';
import {
  getKolamNavigationRouteTarget,
  kolamNavigationSections,
} from '../src/domain/kolam-navigation';

test('defines shell areas for Kolam POS and AM without dev planning modules', () => {
  expect(getShellModulesByArea('kolam').map(module => module.id)).toEqual([
    'kolam',
    'settings',
    'checkout',
  ]);
  expect(getShellModulesByArea('pos').map(module => module.id)).toEqual([
    'catalog',
    'sales',
    'cashflow',
    'customer',
  ]);
  expect(getShellModulesByArea('am').map(module => module.id)).toEqual(['am']);
  expect(getShellModulesByArea('plugins')).toEqual([]);
  expect(getShellModulesByArea('preparation')).toEqual([]);
});

test('summarizes shell area coverage for sidebar navigation', () => {
  expect(getShellAreaCoverage('pos')).toEqual(
    expect.objectContaining({
      area: 'pos',
      moduleCount: 4,
      routeCount: 15,
      summaryLabel: '4 modul / 15 route',
    }),
  );
  expect(getShellAreaCoverage('am')).toEqual(
    expect.objectContaining({
      area: 'am',
      moduleCount: 1,
      routeCount: 16,
      summaryLabel: '1 modul / 16 route',
    }),
  );
  expect(getShellAreaCoverage('plugins').summaryLabel).toBe('0 modul / 0 route');
  expect(getShellAreaCoverage('preparation').summaryLabel).toBe('0 modul / 0 route');
});

test('keeps every shell module tied to a source repo and route list', () => {
  shellModules.forEach(module => {
    expect(module.sourceRepo.startsWith('E:\\Projects')).toBe(true);
    expect(module.routes.length).toBeGreaterThan(0);
  });

  expect(getShellModule('kolam').sourceRepo).toBe(
    'E:\\Projects\\_latest-da\\da-inventory-frontend',
  );
  expect(() => getShellModule('plugins')).toThrow('Unknown shell module');
});

test('finds module metadata by id', () => {
  expect(getShellModule('am')).toEqual(
    expect.objectContaining({
      area: 'am',
      label: 'AM',
    }),
  );
  expect(() => getShellModule('preparation')).toThrow('Unknown shell module');
});

test('indexes POS and AM module routes as native route surfaces', () => {
  const routeIndex = getShellModuleRouteIndex();

  expect(routeIndex.length).toBeGreaterThanOrEqual(31);
  expect(routeIndex.map(route => route.id)).toEqual(
    expect.arrayContaining([
      'catalog:products?sellable=true',
      'sales:orders/:id',
      'sales:sales/:id/status',
      'cashflow:cashflow',
      'cashflow:pos/cashflow/open',
      'customer:customers',
      'customer:account/settings',
      'am:tasks/:id',
      'am:hardware/:rackId/:boxId/:deviceId',
      'am:mutasi/:id',
      'am:admin/activity-log',
    ]),
  );
  expect(routeIndex.map(route => route.id)).not.toEqual(
    expect.arrayContaining(['am:settings/account', 'am:login']),
  );
  expect(getShellModuleRouteEntry('checkout', 'sale-draft')).toEqual(
    null,
  );
  expect(getShellModuleRouteEntry('am', 'transactions/:id')).toEqual(
    expect.objectContaining({
      area: 'am',
      moduleId: 'am',
      route: 'transactions/:id',
      sourceRepo: 'E:\\Projects\\da-automation-management',
    }),
  );
  expect(getShellModuleRouteEntry('plugins', 'DA-Chat-Plugin')).toBeNull();
});

test('keeps sidebar metadata available for native navigation badges', () => {
  expect(shellModules.every(module => module.summary.length > 20)).toBe(true);
  expect(shellModules.map(module => module.iconKind)).toEqual([
    'dashboard',
    'settings',
    'cart',
    'catalog',
    'sales',
    'wallet',
    'people',
    'automation',
  ]);
  expect(shellModules.map(module => module.moduleIcon ?? null)).toEqual([
    'home',
    'settings',
    'pos',
    null,
    null,
    null,
    null,
    'automation',
  ]);
  expect(getShellModule('kolam').routes).toEqual(
    expect.arrayContaining([
      '/',
      'category',
      'tags',
      'custom-fields',
      'custom-field-profiles',
      'units',
      'products',
      'raw-materials',
      'species',
      'taxonomy',
      'iucn-status',
      'service',
      'kontrol-layanan/pending-services',
      'kontrol-layanan/active-tasks',
      'stock-opname',
      'locations',
      'assets',
      'packing-materials',
      'media',
      'suppliers',
      'purchase-order',
      'production',
      'product-serials',
      'source',
      'complaints',
      'campaign',
      'sales/discount-approval',
      'vouchers',
      'metode-pengiriman',
      'shipping-method',
      'terms-templates',
      'enclonura-species',
      'species-request',
      'taxonomy-request',
      'storage-management',
      'storage-history',
      'blogs',
      'blog-topics',
      'finance/bonus',
      'finance/payroll',
      'finance/settings/tax-profile',
      'finance',
      'wallet',
      'asset-purchase',
      'commissions',
      'payable',
      'receivable',
      'routine-expenses',
      'unexpected-expense',
      'unexpected-income',
      'payment-methods',
      'customers',
      'customer-species',
      'customer-storage',
      'customer-storage-logs',
      'list-of-users',
      'list-of-users/hr',
      'list-of-users/kpi',
      'list-of-users/overtime',
      'staff-attendance',
      'staff-attendance/leaves',
      'staff-attendance/me',
    ]), 
  );
  expect(getShellModule('kolam').routes.length).toBeGreaterThanOrEqual(30);
  expect(() => getShellModule('plugins')).toThrow('Unknown shell module');
  expect(() => getShellModule('preparation')).toThrow('Unknown shell module');
  expect(getShellModulesByArea('pos')).toHaveLength(4);
  expect(getShellModule('settings').routes).toEqual(['pengaturan']);
});

test('keeps Kolam shell route metadata aligned with live navigation routes', () => {
  const liveItems = kolamNavigationSections.flatMap(section => section.items);
  const missingRoutes = liveItems
    .filter(item => {
      const target = getKolamNavigationRouteTarget(item);
      const targetRouteSet = new Set(
        getShellModule(target.moduleId).routes.map(route =>
          route === '/' ? '/' : `/${route}`,
        ),
      );
      addKolamShellRouteAliases(targetRouteSet);

      return !targetRouteSet.has(item.route);
    })
    .map(item => item.route);

  expect(missingRoutes).toEqual([]);
});

test('keeps sidebar brand tied to the live Kolam logo contract', () => {
  expect(getSidebarBrand()).toBe(sidebarBrand);
  expect(sidebarBrand.title).toBe('JungleSystem');
  expect(sidebarBrand.subtitle).toBe('Dunia Anura');
  expect(sidebarBrand.sourceComponent).toBe(
    'E:\\Dunia Anura\\logo\\logo\\Logo Jungle System\\Logo\\Color\\Logo Jungle System Color.svg',
  );
  expect(sidebarBrand.expandedSize).toEqual({width: 118, height: 48});
  expect(sidebarBrand.collapsedSize).toBe(32);
  expect(Object.values(sidebarBrand.palette)).toEqual(
    expect.arrayContaining([
      '#29381C',
      '#2EB028',
      '#185406',
      '#A32D2C',
      '#D1C79D',
      '#F4A512',
    ]),
  );
});

function addKolamShellRouteAliases(routeSet: Set<string>) {
  if (routeSet.has('/category')) {
    routeSet.add('/label-dan-field/kategori');
  }
  if (routeSet.has('/brands')) {
    routeSet.add('/label-dan-field/merek');
  }
  if (routeSet.has('/proyek')) {
    routeSet.add('/custom-project');
    routeSet.add('/custom-project/instances');
    routeSet.add('/custom-project/instances/new');
  }
}
