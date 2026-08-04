import {
  AM_ROUTES,
  AM_ROUTE_SECTIONS,
  AM_SIDEBAR_ROUTES,
  getAmRouteByModuleRoute,
  normalizeAmRoute,
} from '../src/domain/am-navigation';

describe('AM navigation parity', () => {
  it('keeps the native AM routes aligned with the current AM FE pages', () => {
    expect(AM_ROUTES.map(route => route.moduleRoute)).toEqual([
      '/',
      'tasks',
      'services',
      'hardware',
      'webhooks',
      'transactions',
      'mutasi',
      'admin/users',
      'admin/activity-log',
    ]);
  });

  it('keeps the AM sidebar aligned with the current AM FE sidebar sections', () => {
    expect(AM_ROUTE_SECTIONS).toEqual([
      'Overview',
      'Automation',
      'Infrastructure',
      'Banking',
      'Administration',
    ]);

    expect(AM_SIDEBAR_ROUTES.map(route => route.moduleRoute)).toEqual([
      '/',
      'services',
      'hardware',
      'webhooks',
      'transactions',
      'mutasi',
      'admin/users',
      'admin/activity-log',
    ]);
  });

  it('keeps Services header copy aligned with AM FE', () => {
    expect(
      AM_ROUTES.find(route => route.moduleRoute === 'services')?.description,
    ).toBe('Manage automation services. Click a row to view history.');
    expect(
      AM_ROUTES.find(route => route.moduleRoute === 'webhooks')?.description,
    ).toBe('Manage outgoing webhook endpoints and monitor delivery logs.');
    expect(
      AM_ROUTES.find(route => route.moduleRoute === 'mutasi')?.description,
    ).toBe('Incoming and outgoing transaction records across all accounts.');
    expect(
      AM_ROUTES.find(route => route.moduleRoute === 'admin/users')?.description,
    ).toBe('Manage user accounts, assign roles, and control access permissions.');
    expect(
      AM_ROUTES.find(route => route.moduleRoute === 'admin/activity-log')?.description,
    ).toBe(
      'Catatan setiap akses halaman dan API request. Otomatis hapus setelah 90 hari. Super Admin bisa hapus manual per baris terpilih atau sesuai filter.',
    );
  });

  it('keeps detail routes selected under their AM sidebar parents', () => {
    expect(getAmRouteByModuleRoute('/tasks/task-1').moduleRoute).toBe('tasks');
    expect(
      getAmRouteByModuleRoute('hardware/rack-1/box-1/device-1').moduleRoute,
    ).toBe('hardware');
    expect(getAmRouteByModuleRoute('transactions/trx-1').moduleRoute).toBe(
      'transactions',
    );
    expect(getAmRouteByModuleRoute('mutasi/mutasi-1').moduleRoute).toBe(
      'mutasi',
    );
    expect(getAmRouteByModuleRoute('/settings/account/').moduleRoute).toBe('/');
    expect(getAmRouteByModuleRoute('login').moduleRoute).toBe('/');
  });

  it('normalizes AM module routes before matching them', () => {
    expect(normalizeAmRoute(null)).toBe('/');
    expect(normalizeAmRoute('/hardware/rack-1/')).toBe('hardware/rack-1');
  });
});
