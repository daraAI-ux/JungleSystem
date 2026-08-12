export type AmRouteId =
  | 'dashboard'
  | 'tasks'
  | 'services'
  | 'hardware'
  | 'webhooks'
  | 'transactions'
  | 'mutasi'
  | 'users'
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
    label: 'Beranda',
    section: 'Ringkasan',
    path: '/',
    moduleRoute: '/',
    description: 'Ringkasan akun, device, transfer, dan mutasi AM.',
  },
  {
    id: 'tasks',
    label: 'Tugas',
    section: 'Automasi',
    path: '/tasks',
    moduleRoute: 'tasks',
    description: 'Monitor dan kelola automation tasks lintas device.',
    sidebar: false,
  },
  {
    id: 'services',
    label: 'Layanan',
    section: 'Automasi',
    path: '/services',
    moduleRoute: 'services',
    description: 'Kelola layanan automasi. Klik baris untuk melihat riwayat.',
  },
  {
    id: 'hardware',
    label: 'Perangkat',
    section: 'Infrastruktur',
    path: '/hardware',
    moduleRoute: 'hardware',
    description: 'Rack, box, device, dan koneksi ADB.',
  },
  {
    id: 'webhooks',
    label: 'Webhooks',
    section: 'Infrastruktur',
    path: '/webhooks',
    moduleRoute: 'webhooks',
    description: 'Kelola endpoint webhook keluar dan pantau log pengiriman.',
  },
  {
    id: 'transactions',
    label: 'Transfer',
    section: 'Perbankan',
    path: '/transactions',
    moduleRoute: 'transactions',
    description: 'Transfer bank dan status eksekusi.',
  },
  {
    id: 'mutasi',
    label: 'Mutasi',
    section: 'Perbankan',
    path: '/mutasi',
    moduleRoute: 'mutasi',
    description: 'Catatan transaksi masuk dan keluar di semua akun.',
  },
  {
    id: 'users',
    label: 'Pengguna',
    section: 'Administrasi',
    path: '/admin/users',
    moduleRoute: 'admin/users',
    description: 'Kelola akun pengguna, role, dan izin akses.',
  },
  {
    id: 'activity-log',
    label: 'Log Aktivitas',
    section: 'Administrasi',
    path: '/admin/activity-log',
    moduleRoute: 'admin/activity-log',
    description:
      'Catatan setiap akses halaman dan API request. Otomatis hapus setelah 90 hari. Super Admin bisa hapus manual per baris terpilih atau sesuai filter.',
  },
];

export const AM_ROUTE_SECTIONS = [
  'Ringkasan',
  'Automasi',
  'Infrastruktur',
  'Perbankan',
  'Administrasi',
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
  return route;
}
