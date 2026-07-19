import {
  filterCommandIndex,
  getCommandPaletteSections,
  getCommandIndex,
  getCommandIndexStats,
} from '../src/domain/command-index';

describe('unified command index', () => {
  it('indexes shell modules runtime actions and plugin routes', () => {
    const commands = getCommandIndex();

    expect(getCommandIndexStats(commands)).toEqual({
      total: 423,
      modules: 10,
      moduleRoutes: 57,
      kolamSurfaces: 5,
      navigationRoutes: 268,
      amRoutes: 5,
      actions: 14,
      pluginRoutes: 64,
    });
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'module:checkout',
        kind: 'module',
        moduleId: 'checkout',
        area: 'pos',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'module-route:checkout:payment',
        kind: 'module-route',
        moduleId: 'checkout',
        area: 'pos',
        route: 'payment',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'module-route:am:transactions/:id',
        kind: 'module-route',
        moduleId: 'am',
        area: 'am',
        route: 'transactions/:id',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'module-route:am:am-be/routes/webhook',
        kind: 'module-route',
        moduleId: 'am',
        area: 'am',
        route: 'am-be/routes/webhook',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'kolam-surface:finance',
        kind: 'kolam-surface',
        moduleId: 'kolam',
        area: 'kolam',
        route: 'finance / wallet / payable / receivable',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'navigation-route:/customer-storage',
        kind: 'navigation-route',
        moduleId: 'kolam',
        area: 'kolam',
        route: '/customer-storage',
        description:
          'User - Customer - Customer storage items management',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'navigation-route:/products/create',
        kind: 'navigation-route',
        moduleId: 'catalog',
        area: 'pos',
        route: '/products/create',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'navigation-route:/sales/create',
        kind: 'navigation-route',
        moduleId: 'sales',
        area: 'pos',
        route: '/sales/create',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'navigation-route:/asset-purchase/create',
        kind: 'navigation-route',
        moduleId: 'kolam',
        area: 'kolam',
        route: '/asset-purchase/create',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'navigation-route:/customers/:id/edit',
        kind: 'navigation-route',
        moduleId: 'customer',
        area: 'pos',
        route: '/customers/:id/edit',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'navigation-route:/campaign/dara-seo/keywords',
        kind: 'navigation-route',
        moduleId: 'kolam',
        area: 'kolam',
        route: '/campaign/dara-seo/keywords',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'navigation-route:/finance/payroll/slip/:slipId',
        kind: 'navigation-route',
        moduleId: 'kolam',
        area: 'kolam',
        route: '/finance/payroll/slip/:slipId',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'navigation-route:/teranura/:id/statistics',
        kind: 'navigation-route',
        moduleId: 'kolam',
        area: 'kolam',
        route: '/teranura/:id/statistics',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'action:am-sync-dashboard',
        kind: 'runtime-action',
        moduleId: 'am',
        area: 'am',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'module:preparation',
        kind: 'module',
        moduleId: 'preparation',
        area: 'preparation',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'action:preparation-runtime-audit',
        kind: 'runtime-action',
        moduleId: 'preparation',
        area: 'preparation',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'am-route:tasks',
        kind: 'am-route',
        moduleId: 'am',
        area: 'am',
        route: 'am-fe/(dashboard)/tasks / am-be/routes/task',
      }),
    );
    expect(commands).toContainEqual(
      expect.objectContaining({
        id: 'plugin-route:chat:/team-chat',
        kind: 'plugin-route',
        moduleId: 'plugins',
        area: 'plugins',
        route: '/team-chat',
      }),
    );
  });

  it('filters commands across routes actions sources and access requirements', () => {
    const commands = getCommandIndex();

    expect(filterCommandIndex(commands, 'cashflow').map(command => command.id)).toEqual(
      expect.arrayContaining([
        'module:cashflow',
        'module-route:cashflow:pos/cashflow/open',
        'navigation-route:/cashflow-session',
        'action:pos-open-cashflow',
        'action:pos-close-cashflow',
      ]),
    );
    expect(filterCommandIndex(commands, 'payment-methods')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'navigation-route:/payment-methods',
        }),
      ]),
    );
    expect(filterCommandIndex(commands, 'staff-attendance')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'navigation-route:/staff-attendance',
        }),
        expect.objectContaining({
          id: 'navigation-route:/staff-attendance/leaves',
        }),
      ]),
    );
    expect(filterCommandIndex(commands, 'purchase-order/:id/edit')).toEqual([
      expect.objectContaining({
        id: 'navigation-route:/purchase-order/:id/edit',
      }),
    ]);
    expect(filterCommandIndex(commands, 'campaign/dara-seo/keywords')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'navigation-route:/campaign/dara-seo/keywords',
        }),
        expect.objectContaining({
          id: 'plugin-route:dara:/campaign/dara-seo/keywords',
        }),
      ]),
    );
    expect(
      filterCommandIndex(commands, 'task-manager/tugas-terjadwal'),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'navigation-route:/task-manager/tugas-terjadwal',
        }),
        expect.objectContaining({
          id: 'plugin-route:task-manager:/task-manager/tugas-terjadwal',
        }),
      ]),
    );
    expect(filterCommandIndex(commands, 'products / species')).toEqual([
      expect.objectContaining({
        id: 'kolam-surface:inventory',
      }),
    ]);
    expect(filterCommandIndex(commands, 'sale-draft')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'module-route:checkout:sale-draft',
        }),
      ]),
    );
    expect(filterCommandIndex(commands, 'am-be/routes/task')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'module-route:am:am-be/routes/task',
        }),
        expect.objectContaining({
          id: 'am-route:tasks',
        }),
      ]),
    );
    expect(filterCommandIndex(commands, 'team-chat')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'navigation-route:/team-chat',
        }),
        expect.objectContaining({
          id: 'plugin-route:chat:/team-chat',
        }),
      ]),
    );
    expect(filterCommandIndex(commands, 'access_am')).toEqual([]);
    expect(filterCommandIndex(commands, 'am').length).toBeGreaterThan(1);
  });

  it('groups command palette results by native shell surface', () => {
    const commands = getCommandIndex();
    const sections = getCommandPaletteSections(commands, 2);

    expect(sections.map(section => section.title)).toEqual([
      'Modules',
      'Module Routes',
      'Kolam Surfaces',
      'Navigation Routes',
      'AM Routes',
      'Runtime Actions',
      'Plugin Routes',
    ]);
    expect(sections.every(section => section.commands.length <= 2)).toBe(true);
    expect(sections[0].commands.every(command => command.kind === 'module')).toBe(
      true,
    );
    expect(
      getCommandPaletteSections(filterCommandIndex(commands, 'team-chat')).map(
        section => section.id,
      ),
    ).toEqual(expect.arrayContaining(['navigation-route', 'plugin-route']));
    expect(
      getCommandPaletteSections(filterCommandIndex(commands, 'sale-draft')).map(
        section => section.id,
      ),
    ).toEqual(expect.arrayContaining(['module-route']));
    expect(
      getCommandPaletteSections(filterCommandIndex(commands, 'am-be/routes/task')).map(
        section => section.id,
      ),
    ).toEqual(expect.arrayContaining(['module-route', 'am-route']));
    expect(
      getCommandPaletteSections(filterCommandIndex(commands, 'products / species')).map(
        section => section.id,
      ),
    ).toEqual(['kolam-surface']);
    expect(
      getCommandPaletteSections(filterCommandIndex(commands, 'customer-storage')).map(
        section => section.id,
      ),
    ).toEqual(expect.arrayContaining(['navigation-route']));
  });
});
