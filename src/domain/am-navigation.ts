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
  | 'activity-log'
  | 'login';

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
    description: 'Manage automation services. Click a row to view history.',
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
    description: 'Manage outgoing webhook endpoints and monitor delivery logs.',
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
    description: 'Incoming and outgoing transaction records across all accounts.',
  },
  {
    id: 'users',
    label: 'Users',
    section: 'Administration',
    path: '/admin/users',
    moduleRoute: 'admin/users',
    description: 'Manage user accounts, assign roles, and control access permissions.',
  },
  {
    id: 'activity-log',
    label: 'Activity Log',
    section: 'Administration',
    path: '/admin/activity-log',
    moduleRoute: 'admin/activity-log',
    description:
      'Catatan setiap akses halaman dan API request. Otomatis hapus setelah 90 hari. Super Admin bisa hapus manual per baris terpilih atau sesuai filter.',
  },
  {
    id: 'settings-account',
    label: 'Account Settings',
    section: 'Administration',
    path: '/settings/account',
    moduleRoute: 'settings/account',
    description: 'Manage your personal information, photo, and other profile details.',
    sidebar: false,
  },
  {
    id: 'login',
    label: 'Login',
    section: 'Administration',
    path: '/login',
    moduleRoute: 'login',
    description: 'Masuk ke AM BE live.',
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
  if (route.startsWith('login')) return 'login';
  return route;
}
