import fs from 'fs';
import path from 'path';
import {
  AM_ROUTES,
  AM_ROUTE_SECTIONS,
  AM_SIDEBAR_ROUTES,
  getAmRouteByModuleRoute,
  normalizeAmRoute,
} from '../src/domain/am-navigation';
import {getShellModule} from '../src/domain/app-shell';

const AM_FE_DASHBOARD_ROOT =
  'E:\\Projects\\da-automation-management\\am-fe\\src\\app\\(dashboard)';
const AM_NATIVE_OMITTED_FE_ROUTES = new Set([
  'settings/account',
]);

describe('AM navigation parity', () => {
  it('covers every current AM FE dashboard page in the native AM shell route map', () => {
    const feRoutes = listAmFeDashboardPageRoutes(AM_FE_DASHBOARD_ROOT)
      .filter(route => !AM_NATIVE_OMITTED_FE_ROUTES.has(route));
    const nativeRoutes = new Set(getShellModule('am').routes);

    expect(feRoutes).toEqual([
      '/',
      ':catchAll',
      'admin/activity-log',
      'admin/users',
      'hardware',
      'hardware/:rackId',
      'hardware/:rackId/:boxId',
      'hardware/:rackId/:boxId/:deviceId',
      'mutasi',
      'services',
      'tasks',
      'tasks/:id',
      'transactions',
      'transactions/:id',
      'webhooks',
    ]);
    expect(feRoutes.every(route => nativeRoutes.has(route))).toBe(true);
    expect(nativeRoutes.has('settings/account')).toBe(false);
  });

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

function listAmFeDashboardPageRoutes(root: string) {
  if (!fs.existsSync(root)) {
    throw new Error(`AM FE dashboard root not found: ${root}`);
  }

  const routes: string[] = [];
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name === 'page.tsx') {
        routes.push(toAmRoute(root, entryPath));
      }
    }
  };

  visit(root);
  return routes.sort();
}

function toAmRoute(root: string, pagePath: string) {
  const directory = path.dirname(pagePath);
  const relative = path.relative(root, directory);
  if (!relative) {
    return '/';
  }

  return relative
    .split(path.sep)
    .map(segment => {
      if (segment === '[...catchAll]') return ':catchAll';
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return `:${segment.slice(1, -1)}`;
      }
      return segment;
    })
    .join('/');
}
