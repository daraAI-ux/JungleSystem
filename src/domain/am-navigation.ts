export type AmRouteId =
  | 'dashboard'
  | 'tasks'
  | 'services'
  | 'hardware'
  | 'webhooks'
  | 'transactions'
  | 'mutasi'
  | 'users'
  | 'settings-account'
  | 'activity-log';

export interface AmRouteItem {
  id: AmRouteId;
  label: string;
  section: string;
  path: string;
  moduleRoute: string;
  description: string;
  sidebar?: boolean;
}

export const AM_ROUTES: AmRouteItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    section: 'Overview',
    path: '/',
    moduleRoute: '/',
    description: 'Ringkasan akun, device, transfer, dan mutasi AM.',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    section: 'Automation',
    path: '/tasks',
    moduleRoute: 'tasks',
    description: 'Monitor dan kelola automation tasks lintas device.',
    sidebar: false,
  },
  {
    id: 'services',
    label: 'Services',
    section: 'Automation',
    path: '/services',
    moduleRoute: 'services',
    description: 'Service account dan worker automation.',
  },
  {
    id: 'hardware',
    label: 'Hardware',
    section: 'Infrastructure',
    path: '/hardware',
    moduleRoute: 'hardware',
    description: 'Rack, box, device, dan koneksi ADB.',
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    section: 'Infrastructure',
    path: '/webhooks',
    moduleRoute: 'webhooks',
    description: 'Konfigurasi dan event webhook AM.',
  },
  {
    id: 'transactions',
    label: 'Transfers',
    section: 'Banking',
    path: '/transactions',
    moduleRoute: 'transactions',
    description: 'Transfer bank dan status eksekusi.',
  },
  {
    id: 'mutasi',
    label: 'Mutations',
    section: 'Banking',
    path: '/mutasi',
    moduleRoute: 'mutasi',
    description: 'Mutasi rekening dan ingest transaksi.',
  },
  {
    id: 'users',
    label: 'Users',
    section: 'Administration',
    path: '/admin/users',
    moduleRoute: 'admin/users',
    description: 'User AM dan permission role.',
  },
  {
    id: 'activity-log',
    label: 'Activity Log',
    section: 'Administration',
    path: '/admin/activity-log',
    moduleRoute: 'admin/activity-log',
    description: 'Audit log aktivitas AM.',
  },
  {
    id: 'settings-account',
    label: 'Account Settings',
    section: 'Administration',
    path: '/settings/account',
    moduleRoute: 'settings/account',
    description: 'Profil akun AM, password, dan area akun sesuai AM FE.',
    sidebar: false,
  },
];

export const AM_ROUTE_SECTIONS = [
  'Overview',
  'Automation',
  'Infrastructure',
  'Banking',
  'Administration',
];

export const AM_SIDEBAR_ROUTES = AM_ROUTES.filter(
  route => route.sidebar !== false,
);

export function getAmRouteByModuleRoute(route?: string | null): AmRouteItem {
  const normalized = normalizeAmRoute(route);
  const parentRoute = getAmParentRoute(normalized);

  return (
    AM_ROUTES.find(
      item => item.moduleRoute === parentRoute || item.path === `/${parentRoute}`,
    ) ?? AM_ROUTES[0]
  );
}

export function normalizeAmRoute(route?: string | null) {
  if (!route || route === '/') return '/';
  return route.replace(/^\/+/, '').replace(/\/+$/, '');
}

function getAmParentRoute(route: string) {
  if (route === '/') return route;
  if (route.startsWith('tasks')) return 'tasks';
  if (route.startsWith('hardware')) return 'hardware';
  if (route.startsWith('transactions')) return 'transactions';
  if (route.startsWith('mutasi')) return 'mutasi';
  if (route.startsWith('services')) return 'services';
  if (route.startsWith('webhooks')) return 'webhooks';
  if (route.startsWith('admin/users')) return 'admin/users';
  if (route.startsWith('admin/activity-log')) return 'admin/activity-log';
  if (route.startsWith('settings/account')) return 'settings/account';
  return route;
}
