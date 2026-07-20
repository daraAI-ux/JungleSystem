import {
  getShellModule,
  type AppModule,
  type ShellModuleRouteEntry,
} from './app-shell';
import type { KolamNavigationItem } from './kolam-navigation';
import type { PluginRouteEntry, UnifiedSurface } from './unified';

export interface TopNavUserMenuItem {
  id:
    | 'dashboard'
    | 'settings'
    | 'web-settings'
    | 'command-menu'
    | 'support'
    | 'logout';
  label: string;
  routeHint: string;
  iconKind: TopNavUserMenuIconKind;
  trailingIconKind?: 'chevron';
  section: 'main' | 'command' | 'support' | 'session';
  sourceComponent: string;
  adminOnly?: boolean;
}

export type TopNavUserMenuIconKind =
  | 'dashboard'
  | 'settings'
  | 'command'
  | 'support'
  | 'logout';

export interface TopNavBreadcrumbItem {
  disabled?: boolean;
  id: string;
  label: string;
  routeHint: string;
  targetModule?: AppModule;
  current: boolean;
}

export interface TopNavRightControl {
  id: 'notifications' | 'avatar';
  label: string;
}

export interface TopNavChromeContract {
  sourceComponent: string;
  height: number;
  backgroundColor: '#ffffff';
  borderBottomWidth: 0;
  leftGap: number;
  triggerSize: number;
  separatorHeight: number;
  rightGap: number;
  menuMinWidth: number;
  menuPlacement: 'bottom';
}

export interface TopNavUserMenuCloseControl {
  id: 'close-user-menu';
  label: string;
  iconKind: 'x';
  sourceComponent: string;
}

export const topNavUserMenuItems: TopNavUserMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    routeHint: '/',
    iconKind: 'dashboard',
    section: 'main',
    sourceComponent:
      'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
  },
  {
    id: 'settings',
    label: 'Settings',
    routeHint: '/settings',
    iconKind: 'settings',
    section: 'main',
    sourceComponent:
      'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
  },
  {
    id: 'web-settings',
    label: 'Web Settings',
    routeHint: '/settings/websetting',
    iconKind: 'settings',
    section: 'main',
    sourceComponent:
      'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
    adminOnly: true,
  },
  {
    id: 'command-menu',
    label: 'Command Menu',
    routeHint: 'Ctrl K',
    iconKind: 'command',
    section: 'command',
    sourceComponent:
      'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
  },
  {
    id: 'support',
    label: 'Contact Support',
    routeHint: '#contact-s',
    iconKind: 'support',
    section: 'support',
    sourceComponent:
      'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
  },
  {
    id: 'logout',
    label: 'Log out',
    routeHint: 'auth/logout',
    iconKind: 'logout',
    section: 'session',
    sourceComponent:
      'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
  },
];

export function getTopNavUserMenuItems(roleKey?: string): TopNavUserMenuItem[] {
  const canSeeWebSettings = isTopNavAdminRole(roleKey);

  return topNavUserMenuItems.filter(
    item => !item.adminOnly || canSeeWebSettings,
  );
}

export function getTopNavUserMenuPreview(
  items: TopNavUserMenuItem[] = getTopNavUserMenuItems(),
  limit = 3,
) {
  return items
    .slice(0, limit)
    .map(item => item.label)
    .join(' / ');
}

export function getTopNavRightControls(): TopNavRightControl[] {
  return [
    {
      id: 'notifications',
      label: 'Notifications',
    },
    {
      id: 'avatar',
      label: 'User menu',
    },
  ];
}

export function getTopNavUserMenuCloseControl(): TopNavUserMenuCloseControl {
  return {
    id: 'close-user-menu',
    label: 'Close user menu',
    iconKind: 'x',
    sourceComponent:
      'E:\\Projects\\da-inventory-frontend\\src\\components\\app-sidebar-nav.tsx',
  };
}

export function getTopNavChromeContract(): TopNavChromeContract {
  return {
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
  };
}

export function isTopNavAdminRole(roleKey?: string): boolean {
  const normalized = String(roleKey ?? '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-');

  return (
    normalized === 'admin' ||
    normalized === 'super-admin' ||
    normalized === 'super-administrator' ||
    normalized === 'superadmin'
  );
}

export function getTopNavBreadcrumbItems(
  moduleId: AppModule,
  context: {
    activeAmSurface?: UnifiedSurface | null;
    activeKolamSurface?: UnifiedSurface | null;
    activeModuleRoute?: ShellModuleRouteEntry | null;
    activeNavigationItem?: KolamNavigationItem | null;
    activePluginRoute?: PluginRouteEntry | null;
  } = {},
): TopNavBreadcrumbItem[] {
  const dashboardCrumb: TopNavBreadcrumbItem = {
    id: 'dashboard',
    label: 'Dashboard',
    routeHint: '/',
    current: moduleId === 'kolam' && !hasTopNavRouteContext(context),
  };

  if (moduleId === 'kolam' && !hasTopNavRouteContext(context)) {
    return [dashboardCrumb];
  }

  if (moduleId === 'kolam' && context.activeNavigationItem) {
    const parentBreadcrumb = getNavigationParentBreadcrumb(
      context.activeNavigationItem,
      'kolam',
    );

    return compactBreadcrumbs([
      { ...dashboardCrumb, current: false },
      getGroupBreadcrumb(context.activeNavigationItem.group),
      parentBreadcrumb,
      {
        id: `route:${context.activeNavigationItem.route}`,
        label: getNavigationBreadcrumbLabel(context.activeNavigationItem),
        routeHint: context.activeNavigationItem.route,
        targetModule: 'kolam',
        current: true,
      },
    ]);
  }

  if (moduleId === 'kolam' && context.activeKolamSurface) {
    return [
      { ...dashboardCrumb, current: false },
      {
        id: `kolam-surface:${context.activeKolamSurface.id}`,
        label: context.activeKolamSurface.label,
        routeHint: context.activeKolamSurface.route,
        targetModule: 'kolam',
        current: true,
      },
    ];
  }

  const module = getShellModule(moduleId);
  const primaryRoute = module.routes[0] ?? module.id;
  const routeHint = primaryRoute.startsWith('/')
    ? primaryRoute
    : `/${primaryRoute}`;

  const moduleCrumb: TopNavBreadcrumbItem = {
    id: module.id,
    label: module.label,
    routeHint,
    current: !hasTopNavRouteContext(context),
  };

  return compactBreadcrumbs([
    { ...dashboardCrumb, current: false },
    moduleCrumb,
    context.activeModuleRoute
      ? {
          id: `module-route:${context.activeModuleRoute.route}`,
          label: context.activeModuleRoute.moduleLabel,
          routeHint: context.activeModuleRoute.route,
          targetModule: context.activeModuleRoute.moduleId,
          current: true,
        }
      : null,
    context.activeNavigationItem
      ? getGroupBreadcrumb(context.activeNavigationItem.group)
      : null,
    context.activeNavigationItem
      ? getNavigationParentBreadcrumb(context.activeNavigationItem, moduleId)
      : null,
    context.activeNavigationItem
      ? {
          id: `route:${context.activeNavigationItem.route}`,
          label: getNavigationBreadcrumbLabel(context.activeNavigationItem),
          routeHint: context.activeNavigationItem.route,
          targetModule: moduleId,
          current: true,
        }
      : null,
    context.activePluginRoute
      ? {
          id: `plugin-route:${context.activePluginRoute.route}`,
          label: context.activePluginRoute.pluginLabel,
          routeHint: context.activePluginRoute.route,
          targetModule: 'plugins',
          current: true,
        }
      : null,
    context.activeAmSurface
      ? {
          id: `am-surface:${context.activeAmSurface.id}`,
          label: context.activeAmSurface.label,
          routeHint: context.activeAmSurface.route,
          targetModule: 'am',
          current: true,
        }
      : null,
  ]);
}

function getNavigationBreadcrumbLabel(item: KolamNavigationItem) {
  const routePath = item.route.split('?')[0];
  const brandDetail = routePath.match(
    /^\/label-dan-field\/merek\/([^/]+)(?:\/edit)?$/,
  );
  const categoryDetail = routePath.match(
    /^\/label-dan-field\/kategori\/([^/]+)(?:\/edit)?$/,
  );
  const tagDetail = routePath.match(/^\/tags\/([^/]+)(?:\/edit)?$/);
  const customFieldDetail = routePath.match(
    /^\/custom-fields\/([^/]+)(?:\/edit)?$/,
  );
  const unitDetail = routePath.match(/^\/units\/([^/]+)(?:\/edit)?$/);

  if (brandDetail?.[1] && brandDetail[1] !== 'baru') {
    return decodeURIComponent(brandDetail[1]).replace(/-/g, ' ');
  }

  if (categoryDetail?.[1] && categoryDetail[1] !== 'baru') {
    return decodeURIComponent(categoryDetail[1]).replace(/-/g, ' ');
  }

  if (tagDetail?.[1] && tagDetail[1] !== 'baru') {
    return decodeURIComponent(tagDetail[1]).replace(/-/g, ' ');
  }

  if (customFieldDetail?.[1] && customFieldDetail[1] !== 'baru') {
    return decodeURIComponent(customFieldDetail[1]).replace(/-/g, ' ');
  }

  if (unitDetail?.[1] && unitDetail[1] !== 'baru') {
    return decodeURIComponent(unitDetail[1]).replace(/-/g, ' ');
  }

  return item.label;
}

function getNavigationParentBreadcrumb(
  item: KolamNavigationItem,
  moduleId: AppModule,
): TopNavBreadcrumbItem | null {
  const routePath = item.route.split('?')[0];
  const brandDetail = routePath.match(
    /^\/label-dan-field\/merek\/([^/]+)(?:\/edit)?$/,
  );
  const categoryDetail = routePath.match(
    /^\/label-dan-field\/kategori\/([^/]+)(?:\/edit)?$/,
  );
  const tagDetail = routePath.match(/^\/tags\/([^/]+)(?:\/edit)?$/);
  const customFieldDetail = routePath.match(
    /^\/custom-fields\/([^/]+)(?:\/edit)?$/,
  );
  const unitDetail = routePath.match(/^\/units\/([^/]+)(?:\/edit)?$/);

  if (brandDetail?.[1] && brandDetail[1] !== 'baru') {
    return {
      id: 'route:/label-dan-field/merek',
      label: 'Merek',
      routeHint: '/label-dan-field/merek',
      targetModule: moduleId,
      current: false,
    };
  }

  if (categoryDetail?.[1] && categoryDetail[1] !== 'baru') {
    return {
      id: 'route:/label-dan-field/kategori',
      label: 'Kategori',
      routeHint: '/label-dan-field/kategori',
      targetModule: moduleId,
      current: false,
    };
  }

  if (tagDetail?.[1] && tagDetail[1] !== 'baru') {
    return {
      id: 'route:/tags',
      label: 'Tag',
      routeHint: '/tags',
      targetModule: moduleId,
      current: false,
    };
  }

  if (customFieldDetail?.[1] && customFieldDetail[1] !== 'baru') {
    return {
      id: 'route:/custom-fields',
      label: 'Field Kustom',
      routeHint: '/custom-fields',
      targetModule: moduleId,
      current: false,
    };
  }

  if (unitDetail?.[1] && unitDetail[1] !== 'baru') {
    return {
      id: 'route:/units',
      label: 'Satuan',
      routeHint: '/units',
      targetModule: moduleId,
      current: false,
    };
  }

  return null;
}

function getGroupBreadcrumb(
  group: string | undefined,
): TopNavBreadcrumbItem | null {
  if (!group) {
    return null;
  }

  return {
    id: `group:${group}`,
    label: group,
    routeHint: '',
    disabled: true,
    current: false,
  };
}

function compactBreadcrumbs(
  items: Array<TopNavBreadcrumbItem | null>,
): TopNavBreadcrumbItem[] {
  return items.filter((item): item is TopNavBreadcrumbItem => Boolean(item));
}

function hasTopNavRouteContext({
  activeAmSurface,
  activeKolamSurface,
  activeModuleRoute,
  activeNavigationItem,
  activePluginRoute,
}: {
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
}) {
  return Boolean(
    activeAmSurface ||
      activeKolamSurface ||
      activeModuleRoute ||
      activeNavigationItem ||
      activePluginRoute,
  );
}
