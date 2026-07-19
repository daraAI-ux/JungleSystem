import {
  getTopNavBreadcrumbItems,
  getTopNavChromeContract,
  getTopNavRightControls,
  getTopNavUserMenuCloseControl,
  getTopNavUserMenuItems,
  getTopNavUserMenuPreview,
  isTopNavAdminRole,
  topNavUserMenuItems,
} from '../src/domain/top-nav';

describe('topNavUserMenuItems', () => {
  it('mirrors the live Kolam avatar menu actions for the native top nav', () => {
    const sourceComponent =
      'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx';

    expect(topNavUserMenuItems.map(item => item.id)).toEqual([
      'dashboard',
      'settings',
      'web-settings',
      'command-menu',
      'support',
      'logout',
    ]);
    expect(getTopNavUserMenuItems().map(item => item.label)).toEqual([
      'Dashboard',
      'Settings',
      'Command Menu',
      'Contact Support',
      'Log out',
    ]);
    expect(getTopNavUserMenuItems().map(item => item.iconKind)).toEqual([
      'dashboard',
      'settings',
      'command',
      'support',
      'logout',
    ]);
    expect(getTopNavUserMenuItems().map(item => item.trailingIconKind)).toEqual(
      Array(5).fill(undefined),
    );
    expect(getTopNavUserMenuItems().map(item => item.sourceComponent)).toEqual(
      Array(5).fill(sourceComponent),
    );
    expect(getTopNavUserMenuItems().map(item => item.section)).toEqual([
      'main',
      'main',
      'command',
      'support',
      'session',
    ]);
    expect(getTopNavUserMenuItems().map(item => item.routeHint)).toEqual([
      '/',
      '/settings',
      'Ctrl K',
      '#contact-s',
      'auth/logout',
    ]);
    expect(getTopNavUserMenuPreview()).toBe(
      'Dashboard / Settings / Command Menu',
    );
    expect(getTopNavUserMenuPreview(getTopNavUserMenuItems(), 5)).toBe(
      'Dashboard / Settings / Command Menu / Contact Support / Log out',
    );
  });

  it('shows Web Settings for admin roles like the live Kolam avatar menu', () => {
    expect(isTopNavAdminRole('admin')).toBe(true);
    expect(isTopNavAdminRole('super-admin')).toBe(true);
    expect(isTopNavAdminRole('super_administrator')).toBe(true);
    expect(isTopNavAdminRole('staff')).toBe(false);

    expect(
      getTopNavUserMenuItems('super-admin').map(item => item.label),
    ).toEqual([
      'Dashboard',
      'Settings',
      'Web Settings',
      'Command Menu',
      'Contact Support',
      'Log out',
    ]);
    expect(
      getTopNavUserMenuItems('super-admin').map(item => item.iconKind),
    ).toEqual([
      'dashboard',
      'settings',
      'settings',
      'command',
      'support',
      'logout',
    ]);
    expect(
      getTopNavUserMenuItems('super-admin').map(item => item.section),
    ).toEqual(['main', 'main', 'main', 'command', 'support', 'session']);
    expect(
      getTopNavUserMenuItems('super-admin').map(item => item.trailingIconKind),
    ).toEqual(Array(6).fill(undefined));
    expect(
      getTopNavUserMenuPreview(getTopNavUserMenuItems('super-admin')),
    ).toBe('Dashboard / Settings / Web Settings');
  });

  it('builds live-style breadcrumb items for Dashboard and active module', () => {
    expect(getTopNavBreadcrumbItems('kolam')).toEqual([
      {
        id: 'dashboard',
        label: 'Dashboard',
        routeHint: '/',
        current: true,
      },
    ]);

    expect(getTopNavBreadcrumbItems('settings')).toEqual([
      {
        id: 'dashboard',
        label: 'Dashboard',
        routeHint: '/',
        current: false,
      },
      {
        id: 'settings',
        label: 'Settings',
        routeHint: '/settings/websetting',
        current: true,
      },
    ]);

    expect(getTopNavBreadcrumbItems('plugins')).toEqual([
      expect.objectContaining({
        id: 'dashboard',
        current: false,
      }),
      expect.objectContaining({
        id: 'plugins',
        label: 'Plugin',
        routeHint: '/DA-Bantuan-Plugin',
        current: true,
      }),
    ]);
  });

  it('builds route-aware breadcrumbs for active Kolam menu items', () => {
    expect(
      getTopNavBreadcrumbItems('kolam', {
        activeNavigationItem: {
          label: 'Merek',
          route: '/label-dan-field/merek',
          description: 'Kelola merek',
          group: 'Label and Fields',
          requiredAccess: ['kolam'],
        },
      }),
    ).toEqual([
      expect.objectContaining({ id: 'dashboard', current: false }),
      expect.objectContaining({
        id: 'group:Label and Fields',
        disabled: true,
        label: 'Label and Fields',
      }),
      expect.objectContaining({
        id: 'route:/label-dan-field/merek',
        current: true,
        label: 'Merek',
      }),
    ]);
  });

  it('adds a clickable Merek parent breadcrumb for brand detail routes', () => {
    expect(
      getTopNavBreadcrumbItems('kolam', {
        activeNavigationItem: {
          label: 'Merek Detail',
          route: '/label-dan-field/merek/Dunia%20Anura',
          description: 'Detail merek',
          group: 'Label and Fields',
          requiredAccess: ['kolam'],
        },
      }),
    ).toEqual([
      expect.objectContaining({ id: 'dashboard', current: false }),
      expect.objectContaining({
        id: 'group:Label and Fields',
        disabled: true,
        label: 'Label and Fields',
      }),
      expect.objectContaining({
        current: false,
        id: 'route:/label-dan-field/merek',
        label: 'Merek',
        routeHint: '/label-dan-field/merek',
      }),
      expect.objectContaining({
        current: true,
        id: 'route:/label-dan-field/merek/Dunia%20Anura',
        label: 'Dunia Anura',
      }),
    ]);
  });

  it('adds a clickable Kategori parent breadcrumb for category detail routes', () => {
    expect(
      getTopNavBreadcrumbItems('kolam', {
        activeNavigationItem: {
          label: 'Kategori Detail',
          route: '/label-dan-field/kategori/Peralatan',
          description: 'Detail kategori',
          group: 'Label and Fields',
          requiredAccess: ['kolam'],
        },
      }),
    ).toEqual([
      expect.objectContaining({ id: 'dashboard', current: false }),
      expect.objectContaining({
        id: 'group:Label and Fields',
        disabled: true,
        label: 'Label and Fields',
      }),
      expect.objectContaining({
        current: false,
        id: 'route:/label-dan-field/kategori',
        label: 'Kategori',
        routeHint: '/label-dan-field/kategori',
      }),
      expect.objectContaining({
        current: true,
        id: 'route:/label-dan-field/kategori/Peralatan',
        label: 'Peralatan',
      }),
    ]);
  });

  it('keeps the live top nav right control order', () => {
    expect(getTopNavRightControls()).toEqual([
      {
        id: 'notifications',
        label: 'Notifications',
      },
      {
        id: 'avatar',
        label: 'User menu',
      },
    ]);
  });

  it('keeps the native top nav chrome aligned with live AppSidebarNav', () => {
    expect(getTopNavChromeContract()).toEqual({
      sourceComponent:
        'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
      height: 52,
      backgroundColor: '#ffffff',
      borderBottomWidth: 0,
      leftGap: 16,
      triggerSize: 32,
      separatorHeight: 24,
      rightGap: 8,
      menuMinWidth: 240,
      menuPlacement: 'bottom',
    });
  });

  it('keeps an icon-only close affordance for the native avatar menu chrome', () => {
    expect(getTopNavUserMenuCloseControl()).toEqual({
      id: 'close-user-menu',
      label: 'Close user menu',
      iconKind: 'x',
      sourceComponent:
        'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
    });
  });
});
