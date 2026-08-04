import { useEffect, useMemo, useState } from 'react';
import {
  getShellModuleRouteEntry,
  type ShellModuleRouteEntry,
  type AppModule,
} from '../domain/app-shell';
import { getAmRouteByModuleRoute } from '../domain/am-navigation';
import type {AccessScope} from '../domain/auth';
import {
  filterCommandIndex,
  getCommandIndex,
  type CommandEntry,
} from '../domain/command-index';
import {
  getKolamNavigationItemByRuntimeRoute,
  getKolamNavigationRouteTarget,
  type KolamNavigationItem,
  kolamSidebarNavigationSections,
} from '../domain/kolam-navigation';
import { isKolamCampaignRoute } from '../domain/kolam-campaign';
import type {KolamWorkspaceTabSnapshot} from '../domain/kolam-workspace-tabs';
import { runtimeActions, type RuntimeAction } from '../domain/runtime-actions';
import type {
  TopNavBreadcrumbItem,
  TopNavUserMenuItem,
} from '../domain/top-nav';
import {
  getAmSurfaceById,
  getKolamSurfaceById,
  filterPluginRegistry,
  filterEnabledPluginRegistry,
  getPluginRouteEntryIgnoringConfig,
  getPluginRouteIndex,
  pluginRegistry,
  type PluginEnabledConfig,
  type PluginRouteEntry,
  type UnifiedSurface,
} from '../domain/unified';
import {getKolamWebSetting} from '../services/kolam-api';

const DEFAULT_NAVIGATION_ACCESS_SCOPE: AccessScope = {
  am: true,
  kolam: true,
  pos: true,
};

export function useKolamNavigationController({
  accessScope = DEFAULT_NAVIGATION_ACCESS_SCOPE,
  onMessage,
}: {
  accessScope?: AccessScope;
  onMessage: (message: string) => void;
}) {
  const [activeModule, setActiveModule] = useState<AppModule>('kolam');
  const [activeNavigationItem, setActiveNavigationItem] =
    useState<KolamNavigationItem | null>(null);
  const [activePluginRoute, setActivePluginRoute] =
    useState<PluginRouteEntry | null>(null);
  const [activeAmSurface, setActiveAmSurface] = useState<UnifiedSurface | null>(
    null,
  );
  const [activeKolamSurface, setActiveKolamSurface] =
    useState<UnifiedSurface | null>(null);
  const [activeModuleRoute, setActiveModuleRoute] =
    useState<ShellModuleRouteEntry | null>(null);
  const [pluginSearch, setPluginSearch] = useState('');
  const [pluginConfig, setPluginConfig] = useState<PluginEnabledConfig | null>(
    null,
  );
  const [commandSearch, setCommandSearch] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedKolamMenuSections, setExpandedKolamMenuSections] = useState<
    Record<string, boolean>
  >({ inventory: true });
  const [kolamMenuSectionOrder, setKolamMenuSectionOrder] = useState<string[]>(
    () => kolamSidebarNavigationSections.map(section => section.id),
  );
  const [isAttentionPanelOpen, setIsAttentionPanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    getKolamWebSetting()
      .then(setting => {
        if (mounted) {
          setPluginConfig(setting.kolamPlugins ?? null);
        }
      })
      .catch(() => {
        if (mounted) {
          setPluginConfig(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const enabledPlugins = useMemo(
    () => filterEnabledPluginRegistry(pluginRegistry, pluginConfig),
    [pluginConfig],
  );
  const filteredPlugins = useMemo(
    () => filterPluginRegistry(enabledPlugins, pluginSearch),
    [enabledPlugins, pluginSearch],
  );
  const pluginRouteIndex = useMemo(
    () => getPluginRouteIndex(pluginRegistry, pluginConfig),
    [pluginConfig],
  );
  const commandIndex = useMemo(
    () => filterCommandsByAccess(getCommandIndex(), accessScope),
    [accessScope],
  );
  const filteredCommands = useMemo(
    () => filterCommandIndex(commandIndex, commandSearch),
    [commandIndex, commandSearch],
  );

  const handleModuleSelect = (module: AppModule) => {
    if (isAmModule(module) && !accessScope.am) {
      onMessage('AM tidak dibuka karena sesi Kolam tidak memiliki akses AM.');
      return;
    }

    const defaultAmRoute =
      module === 'am' ? getShellModuleRouteEntry('am', '/') : null;

    setActiveModule(module);
    setActiveNavigationItem(
      module === 'settings'
        ? getSettingsNavigationItem()
        : null,
    );
    setActivePluginRoute(null);
    setActiveAmSurface(null);
    setActiveKolamSurface(null);
    setActiveModuleRoute(defaultAmRoute);
  };

  const openQuickSearch = () => {
    setCommandSearch('');
    setIsCommandPaletteOpen(true);
    setIsUserMenuOpen(false);
    setIsAttentionPanelOpen(false);
    onMessage('Quick Search membuka CommandPalette native.');
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(current => !current);
    setIsAttentionPanelOpen(false);
    onMessage('User menu native mengikuti avatar dropdown Kolam.');
  };

  const openDashboardFromBreadcrumb = () => {
    handleModuleSelect('kolam');
    onMessage('Dashboard dibuka dari breadcrumb native.');
  };

  const handleBreadcrumbPress = (item: TopNavBreadcrumbItem) => {
    if (item.disabled || item.current) {
      return;
    }

    if (item.id === 'dashboard' || item.routeHint === '/') {
      openDashboardFromBreadcrumb();
      return;
    }

    if (item.routeHint) {
      const navigationItem = getKolamNavigationItemByRuntimeRoute(
        item.routeHint,
      );

      if (navigationItem) {
        handleKolamNavigationItem(navigationItem);
        onMessage(`${item.label} dibuka dari breadcrumb header.`);
        return;
      }
    }

    if (item.targetModule) {
      handleModuleSelect(item.targetModule);
      onMessage(`${item.label} dibuka dari breadcrumb header.`);
    }
  };

  const toggleAttentionPanel = () => {
    setIsAttentionPanelOpen(current => !current);
    setIsUserMenuOpen(false);
    onMessage('Attention panel mengikuti readiness dan sync state native.');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(current => {
      const next = !current;
      onMessage(
        next
          ? 'Sidebar masuk dock native seperti Kolam live.'
          : 'Sidebar kembali penuh dengan label dan route.',
      );
      return next;
    });
  };

  const seeAllNotifications = () => {
    setIsAttentionPanelOpen(false);
    handleDashboardRouteContext('/notifications');
    onMessage('Notifikasi dibuka.');
  };

  const handleUserMenuAction = async (
    item: TopNavUserMenuItem,
    onSignOut: () => Promise<void>,
  ) => {
    setIsUserMenuOpen(false);

    if (item.id === 'logout') {
      await onSignOut();
      return;
    }

    if (item.id === 'portal' || item.id === 'employee-help') {
      const portalItem = getKolamNavigationItemByRuntimeRoute('/portal');

      setActiveModule('kolam');
      setActiveNavigationItem(portalItem ?? null);
      setActivePluginRoute(null);
      setActiveAmSurface(null);
      setActiveKolamSurface(null);
      setActiveModuleRoute(null);
      setCommandSearch('portal');
      onMessage('Portal karyawan dibuka dari user menu native.');
      return;
    }

    if (item.id === 'web-settings') {
      setActiveModule('settings');
      setActiveNavigationItem(getSettingsNavigationItem());
      setActivePluginRoute(null);
      setActiveAmSurface(null);
      setActiveKolamSurface(null);
      setActiveModuleRoute(null);
      setCommandSearch('websetting');
      onMessage('Web Settings Kolam dibuka dari user menu native.');
      return;
    }

    if (item.id === 'command-menu') {
      setCommandSearch('');
      setIsCommandPaletteOpen(true);
      onMessage('Command Menu native siap dari user menu.');
      return;
    }

    const routeItem = getKolamNavigationItemByRuntimeRoute(item.routeHint);

    setActiveModule('kolam');
    setActiveNavigationItem(routeItem ?? null);
    setActivePluginRoute(null);
    setActiveAmSurface(null);
    setActiveKolamSurface(null);
    setActiveModuleRoute(null);
    setCommandSearch(item.label);
    onMessage(`${item.label} dibuka dari user menu native.`);
  };

  const handleCommand = async (
    command: CommandEntry,
    onRuntimeAction: (action: RuntimeAction) => Promise<void>,
  ) => {
    setIsCommandPaletteOpen(false);

    if (command.kind === 'module') {
      handleModuleSelect(command.moduleId);
      if (isAmModule(command.moduleId) && !accessScope.am) {
        return;
      }
      onMessage(`${command.label} dibuka dari command index.`);
      return;
    }

    if (command.kind === 'module-route') {
      if (isAmCommand(command, accessScope)) {
        onMessage('AM tidak dibuka karena sesi Kolam tidak memiliki akses AM.');
        return;
      }

      const route = getShellModuleRouteEntry(command.moduleId, command.route);

      setActiveModule(command.moduleId);
      setActiveNavigationItem(null);
      setActivePluginRoute(null);
      setActiveAmSurface(null);
      setActiveKolamSurface(null);
      setActiveModuleRoute(route);
      setCommandSearch(command.route ?? command.label);
      onMessage(
        `${command.label} dibuka dari route modul native (${command.route}).`,
      );
      return;
    }

    if (command.kind === 'kolam-surface') {
      const surface = getKolamSurfaceById(command.kolamSurfaceId);

      setActiveModule('kolam');
      setActiveNavigationItem(null);
      setActivePluginRoute(null);
      setActiveAmSurface(null);
      setActiveKolamSurface(surface);
      setActiveModuleRoute(null);
      setCommandSearch(command.route ?? command.label);
      onMessage(`${command.label} dibuka di Kolam native (${command.route}).`);
      return;
    }

    if (command.kind === 'navigation-route') {
      setActiveModule(command.moduleId);
      setActiveNavigationItem(
        command.route
          ? getKolamNavigationItemByRuntimeRoute(command.route)
          : null,
      );
      setActivePluginRoute(null);
      setActiveAmSurface(null);
      setActiveKolamSurface(null);
      setActiveModuleRoute(null);
      setCommandSearch(command.route?.replace(/^\//, '') ?? command.label);
      onMessage(
        `${command.label} dibuka dari route navigasi Kolam native (${command.route}).`,
      );
      return;
    }

    if (command.kind === 'am-route') {
      if (!accessScope.am) {
        onMessage('AM tidak dibuka karena sesi Kolam tidak memiliki akses AM.');
        return;
      }

      const surface = getAmSurfaceById(command.amSurfaceId);
      const route = getAmModuleRouteEntry(
        command.route ?? surface?.route,
        surface?.id,
      );

      setActiveModule('am');
      setActiveNavigationItem(null);
      setActivePluginRoute(null);
      setActiveAmSurface(null);
      setActiveKolamSurface(null);
      setActiveModuleRoute(route);
      setCommandSearch(route?.route ?? command.route ?? command.label);
      onMessage(
        `${command.label} dibuka dari sidebar AM native (${route?.route ?? command.route}).`,
      );
      return;
    }

    const action = runtimeActions.find(item => item.id === command.actionId);
    if (action) {
      await onRuntimeAction(action);
    }
  };

  const handleKolamNavigationItem = (item: KolamNavigationItem) => {
    const disabledPluginRoute = getPluginRouteEntryIgnoringConfig(
      item.route,
    );

    if (
      disabledPluginRoute &&
      !pluginRouteIndex.some(
        route =>
          route.pluginId === disabledPluginRoute.pluginId &&
          route.route === disabledPluginRoute.route,
      )
    ) {
      onMessage(
        `${disabledPluginRoute.pluginLabel} dinonaktifkan di Settings. Route ${item.route} tidak dibuka.`,
      );
      return;
    }

    const target = getKolamNavigationRouteTarget(item);
    setActiveModule(target.moduleId);
    setActiveNavigationItem(item);
    setActivePluginRoute(null);
    setActiveAmSurface(null);
    setActiveKolamSurface(null);
    setActiveModuleRoute(null);
    setCommandSearch(target.searchHint);
    onMessage(target.message);
  };

  const handlePluginRouteSelect = (route: PluginRouteEntry) => {
    const enabledRoute = pluginRouteIndex.find(
      item => item.pluginId === route.pluginId && item.route === route.route,
    );

    if (!enabledRoute) {
      onMessage(
        `${route.pluginLabel} dinonaktifkan di Settings. Route ${route.route} tidak dibuka.`,
      );
      return;
    }
    onMessage(`${enabledRoute.pluginLabel} route tidak dibuka karena Plugin Hub sudah dihapus.`);
  };

  const handleAmSurfaceSelect = (surface: UnifiedSurface) => {
    if (!accessScope.am) {
      onMessage('AM tidak dibuka karena sesi Kolam tidak memiliki akses AM.');
      return;
    }

    const route = getAmModuleRouteEntry(surface.route, surface.id);

    setActiveModule('am');
    setActiveNavigationItem(null);
    setActivePluginRoute(null);
    setActiveAmSurface(null);
    setActiveKolamSurface(null);
    setActiveModuleRoute(route);
    setCommandSearch(route?.route ?? surface.route);
    onMessage(
      `${surface.label} dibuka dari sidebar AM native (${route?.route ?? surface.route}).`,
    );
  };

  const handleKolamSurfaceSelect = (surface: UnifiedSurface) => {
    setActiveModule('kolam');
    setActiveNavigationItem(null);
    setActivePluginRoute(null);
    setActiveAmSurface(null);
    setActiveKolamSurface(surface);
    setActiveModuleRoute(null);
    setCommandSearch(surface.route);
    onMessage(
      `${surface.label} dibuka dari Kolam Surface Launcher (${surface.route}).`,
    );
  };

  const handleModuleRouteSelect = (route: ShellModuleRouteEntry) => {
    if (route.moduleId === 'am' && !accessScope.am) {
      onMessage('AM tidak dibuka karena sesi Kolam tidak memiliki akses AM.');
      return;
    }

    const normalizedRoute = route.route.startsWith('/')
      ? route.route
      : `/${route.route}`;

    // Prefer native campaign surface over module-route stub workbench.
    if (isKolamCampaignRoute(normalizedRoute)) {
      const navigationItem =
        getKolamNavigationItemByRuntimeRoute(normalizedRoute);
      if (navigationItem) {
        handleKolamNavigationItem(navigationItem);
        return;
      }
    }

    setActiveModule(route.moduleId);
    setActiveNavigationItem(null);
    setActivePluginRoute(null);
    setActiveAmSurface(null);
    setActiveKolamSurface(null);
    setActiveModuleRoute(route);
    setCommandSearch(route.route);
    onMessage(
      `${route.moduleLabel} route dibuka dari Module Route Launcher (${route.route}).`,
    );
  };

  const handleDashboardRouteContext = (route: string) => {
    const item =
      getManualNavigationItem(route) ??
      getKolamNavigationItemByRuntimeRoute(route);

    if (item) {
      const target = getKolamNavigationRouteTarget(item);
      setActiveModule(target.moduleId);
      setActiveNavigationItem(item);
      setCommandSearch(target.searchHint);
    } else {
      setActiveNavigationItem(null);
    }

    setActivePluginRoute(null);
    setActiveAmSurface(null);
    setActiveKolamSurface(null);
    setActiveModuleRoute(null);
  };

  const restoreWorkspaceTabSnapshot = (snapshot: KolamWorkspaceTabSnapshot) => {
    if (
      (snapshot.activeModule === 'am' ||
        snapshot.activeModuleRoute?.moduleId === 'am' ||
        snapshot.activeAmSurface) &&
      !accessScope.am
    ) {
      handleModuleSelect('kolam');
      return;
    }

    setActiveModule(snapshot.activeModule);
    setActiveNavigationItem(snapshot.activeNavigationItem ?? null);
    setActivePluginRoute(snapshot.activePluginRoute ?? null);
    setActiveAmSurface(snapshot.activeAmSurface ?? null);
    setActiveKolamSurface(snapshot.activeKolamSurface ?? null);
    setActiveModuleRoute(snapshot.activeModuleRoute ?? null);
    setCommandSearch(
      snapshot.activeNavigationItem?.route?.replace(/^\//, '') ??
        snapshot.activePluginRoute?.route ??
        snapshot.activeKolamSurface?.route ??
        snapshot.activeAmSurface?.route ??
        snapshot.activeModuleRoute?.route ??
        '',
    );
  };

  const handleMoveKolamMenuSection = (
    sectionId: string,
    direction: 'up' | 'down',
  ) => {
    setKolamMenuSectionOrder(current => {
      const order = current.length
        ? [...current]
        : kolamSidebarNavigationSections.map(section => section.id);
      const index = order.indexOf(sectionId);
      const nextIndex = direction === 'up' ? index - 1 : index + 1;

      if (index < 0 || nextIndex < 0 || nextIndex >= order.length) {
        return order;
      }

      [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
      return order;
    });
    onMessage('Urutan Kolam Menu disesuaikan di sidebar native.');
  };

  const toggleKolamMenuSection = (sectionId: string) => {
    setExpandedKolamMenuSections(current => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  return {
    activeAmSurface,
    activeKolamSurface,
    activeModuleRoute,
    activeNavigationItem,
    activePluginRoute,
    activeModule,
    commandIndex,
    commandSearch,
    expandedKolamMenuSections,
    filteredCommands,
    filteredPlugins,
    handleCommand,
    handleAmSurfaceSelect,
    handleBreadcrumbPress,
    handleDashboardRouteContext,
    handleKolamNavigationItem,
    handleKolamSurfaceSelect,
    handleModuleSelect,
    handleModuleRouteSelect,
    handlePluginRouteSelect,
    handleMoveKolamMenuSection,
    handleUserMenuAction,
    isAttentionPanelOpen,
    isCommandPaletteOpen,
    isSidebarCollapsed,
    isUserMenuOpen,
    kolamMenuSectionOrder,
    openDashboardFromBreadcrumb,
    openQuickSearch,
    pluginSearch,
    restoreWorkspaceTabSnapshot,
    seeAllNotifications,
    setCommandSearch,
    setIsAttentionPanelOpen,
    setIsCommandPaletteOpen,
    setIsUserMenuOpen,
    setPluginSearch,
    toggleAttentionPanel,
    toggleKolamMenuSection,
    toggleSidebar,
    toggleUserMenu,
  };
}

function getAmModuleRouteEntry(
  route?: string | null,
  surfaceId?: string | null,
): ShellModuleRouteEntry | null {
  const normalizedSurfaceRoute = route?.toLowerCase() ?? '';
  let moduleRoute = getAmRouteByModuleRoute(route).moduleRoute;

  if (
    surfaceId === 'tasks' ||
    normalizedSurfaceRoute.includes('tasks') ||
    normalizedSurfaceRoute.includes('routes/task')
  ) {
    moduleRoute = 'tasks';
  } else if (
    surfaceId === 'hardware' ||
    normalizedSurfaceRoute.includes('hardware') ||
    normalizedSurfaceRoute.includes('routes/device')
  ) {
    moduleRoute = 'hardware';
  } else if (
    normalizedSurfaceRoute.includes('webhook')
  ) {
    moduleRoute = 'webhooks';
  } else if (
    normalizedSurfaceRoute.includes('mutasi')
  ) {
    moduleRoute = 'mutasi';
  }

  return getShellModuleRouteEntry(
    'am',
    moduleRoute,
  );
}

function filterCommandsByAccess(
  commands: CommandEntry[],
  accessScope: AccessScope,
) {
  return commands.filter(command => !isAmCommand(command, accessScope));
}

function isAmCommand(command: CommandEntry, accessScope: AccessScope) {
  return !accessScope.am && (
    command.area === 'am' ||
    command.moduleId === 'am' ||
    command.kind === 'am-route'
  );
}

function isAmModule(module: AppModule) {
  return module === 'am';
}

function getManualNavigationItem(route: string): KolamNavigationItem | null {
  const routePath = route.split('?')[0];
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
      description: 'Detail merek dari Label and Fields Kolam',
      group: 'Label and Fields',
      label: decodeURIComponent(brandDetail[1]).replace(/-/g, ' '),
      requiredAccess: ['kolam'],
      route,
    };
  }

  if (categoryDetail?.[1] && categoryDetail[1] !== 'baru') {
    return {
      description: 'Detail kategori dari Label and Fields Kolam',
      group: 'Label and Fields',
      label: decodeURIComponent(categoryDetail[1]).replace(/-/g, ' '),
      requiredAccess: ['kolam'],
      route,
    };
  }

  if (tagDetail?.[1] && tagDetail[1] !== 'baru') {
    return {
      description: 'Detail tag dari Label and Fields Kolam',
      group: 'Label and Fields',
      label: decodeURIComponent(tagDetail[1]).replace(/-/g, ' '),
      requiredAccess: ['kolam'],
      route,
    };
  }

  if (customFieldDetail?.[1] && customFieldDetail[1] !== 'baru') {
    return {
      description: 'Detail field kustom dari Label and Fields Kolam',
      group: 'Label and Fields',
      label: decodeURIComponent(customFieldDetail[1]).replace(/-/g, ' '),
      requiredAccess: ['kolam'],
      route,
    };
  }

  if (unitDetail?.[1] && unitDetail[1] !== 'baru') {
    return {
      description: 'Detail satuan dari Label and Fields Kolam',
      group: 'Label and Fields',
      label: decodeURIComponent(unitDetail[1]).replace(/-/g, ' '),
      requiredAccess: ['kolam'],
      route,
    };
  }

  if (routePath === '/pengaturan') {
    return getSettingsNavigationItem();
  }

  return null;
}

function getSettingsNavigationItem(): KolamNavigationItem {
  return {
    description: 'Pusat Settings produksi JungleSystem.',
    label: 'Pengaturan',
    requiredAccess: ['kolam'],
    route: '/pengaturan',
  };
}
