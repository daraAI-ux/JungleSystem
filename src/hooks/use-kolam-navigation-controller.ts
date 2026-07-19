import { useMemo, useState } from 'react';
import {
  getShellModuleRouteEntry,
  type ShellModuleRouteEntry,
  type AppModule,
} from '../domain/app-shell';
import {
  filterCommandIndex,
  getCommandIndex,
  type CommandEntry,
} from '../domain/command-index';
import {
  getKolamNavigationItemByRoute,
  getKolamNavigationItemByRuntimeRoute,
  getKolamNavigationRouteTarget,
  type KolamNavigationItem,
  kolamSidebarNavigationSections,
} from '../domain/kolam-navigation';
import { runtimeActions, type RuntimeAction } from '../domain/runtime-actions';
import type {
  TopNavBreadcrumbItem,
  TopNavUserMenuItem,
} from '../domain/top-nav';
import {
  getAmSurfaceById,
  getKolamSurfaceById,
  filterPluginRegistry,
  getPluginRouteIndex,
  pluginRegistry,
  type PluginRouteEntry,
  type UnifiedSurface,
} from '../domain/unified';

export function useKolamNavigationController({
  onMessage,
}: {
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
  const [commandSearch, setCommandSearch] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedKolamMenuSections, setExpandedKolamMenuSections] = useState<
    Record<string, boolean>
  >({});
  const [kolamMenuSectionOrder, setKolamMenuSectionOrder] = useState<string[]>(
    () => kolamSidebarNavigationSections.map(section => section.id),
  );
  const [isAttentionPanelOpen, setIsAttentionPanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const filteredPlugins = useMemo(
    () => filterPluginRegistry(pluginRegistry, pluginSearch),
    [pluginSearch],
  );
  const pluginRouteIndex = useMemo(
    () => getPluginRouteIndex(pluginRegistry),
    [],
  );
  const commandIndex = useMemo(
    () => getCommandIndex({ pluginRoutes: pluginRouteIndex }),
    [pluginRouteIndex],
  );
  const filteredCommands = useMemo(
    () => filterCommandIndex(commandIndex, commandSearch),
    [commandIndex, commandSearch],
  );

  const handleModuleSelect = (module: AppModule) => {
    setActiveModule(module);
    setActiveNavigationItem(null);
    setActivePluginRoute(null);
    setActiveAmSurface(null);
    setActiveKolamSurface(null);
    setActiveModuleRoute(null);
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
    setCommandSearch('activity-log');
    setIsCommandPaletteOpen(true);
    onMessage('See All notifications membuka pencarian Activity Log native.');
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

    if (item.id === 'dashboard') {
      handleModuleSelect('kolam');
      onMessage('Dashboard Kolam dibuka dari user menu native.');
      return;
    }

    if (item.id === 'settings') {
      setActiveModule('settings');
      setActiveNavigationItem(getKolamNavigationItemByRoute('/settings/roles'));
      setActivePluginRoute(null);
      setActiveAmSurface(null);
      setActiveKolamSurface(null);
      setActiveModuleRoute(null);
      setCommandSearch('settings');
      onMessage('Settings Kolam dibuka sebagai surface native.');
      return;
    }

    if (item.id === 'web-settings') {
      setActiveModule('settings');
      setActiveNavigationItem(
        getKolamNavigationItemByRoute('/settings/websetting'),
      );
      setActivePluginRoute(null);
      setActiveAmSurface(null);
      setActiveKolamSurface(null);
      setActiveModuleRoute(null);
      setCommandSearch('web settings');
      onMessage('Web Settings Kolam dibuka dari user menu admin native.');
      return;
    }

    if (item.id === 'command-menu') {
      setCommandSearch('');
      setIsCommandPaletteOpen(true);
      onMessage('Command Menu native siap dari user menu.');
      return;
    }

    handleModuleSelect('plugins');
    setPluginSearch('bantuan');
    onMessage('Contact Support diarahkan ke Plugin Bantuan native.');
  };

  const handleCommand = async (
    command: CommandEntry,
    onRuntimeAction: (action: RuntimeAction) => Promise<void>,
  ) => {
    setIsCommandPaletteOpen(false);

    if (command.kind === 'module') {
      handleModuleSelect(command.moduleId);
      onMessage(`${command.label} dibuka dari command index.`);
      return;
    }

    if (command.kind === 'module-route') {
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
      const surface = getAmSurfaceById(command.amSurfaceId);

      setActiveModule('am');
      setActiveNavigationItem(null);
      setActivePluginRoute(null);
      setActiveAmSurface(surface);
      setActiveKolamSurface(null);
      setActiveModuleRoute(null);
      setCommandSearch(command.route ?? command.label);
      onMessage(`${command.label} dibuka di AM native (${command.route}).`);
      return;
    }

    if (command.kind === 'plugin-route') {
      const route = pluginRouteIndex.find(
        item =>
          item.pluginId === command.pluginId && item.route === command.route,
      );

      setActiveModule('plugins');
      setActiveNavigationItem(null);
      setActivePluginRoute(route ?? null);
      setActiveAmSurface(null);
      setActiveKolamSurface(null);
      setActiveModuleRoute(null);
      setPluginSearch(command.route ?? command.label);
      onMessage(`${command.label} dibuka di Plugin Hub.`);
      return;
    }

    const action = runtimeActions.find(item => item.id === command.actionId);
    if (action) {
      await onRuntimeAction(action);
    }
  };

  const handleKolamNavigationItem = (item: KolamNavigationItem) => {
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
    setActiveModule('plugins');
    setActiveNavigationItem(null);
    setActivePluginRoute(route);
    setActiveAmSurface(null);
    setActiveKolamSurface(null);
    setActiveModuleRoute(null);
    setPluginSearch(route.route);
    onMessage(
      `${route.pluginLabel} route dibuka dari Plugin Hub (${route.route}).`,
    );
  };

  const handleAmSurfaceSelect = (surface: UnifiedSurface) => {
    setActiveModule('am');
    setActiveNavigationItem(null);
    setActivePluginRoute(null);
    setActiveAmSurface(surface);
    setActiveKolamSurface(null);
    setActiveModuleRoute(null);
    setCommandSearch(surface.route);
    onMessage(
      `${surface.label} dibuka dari AM Surface Launcher (${surface.route}).`,
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

function getManualNavigationItem(route: string): KolamNavigationItem | null {
  const routePath = route.split('?')[0];
  const brandDetail = routePath.match(
    /^\/label-dan-field\/merek\/([^/]+)(?:\/edit)?$/,
  );
  const categoryDetail = routePath.match(
    /^\/label-dan-field\/kategori\/([^/]+)(?:\/edit)?$/,
  );

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

  return null;
}
