import { useMemo } from 'react';
import type { KolamAppShellSurfaceProps } from '../components/kolam-app-shell-surface';
import type { AppModule, ShellModuleRouteEntry } from '../domain/app-shell';
import type { AccessScope } from '../domain/auth';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import type { UnifiedSurface } from '../domain/unified';

type SidebarProps = KolamAppShellSurfaceProps['sidebar'];

export function useKolamSidebarController({
  accessScope,
  activeAmSurface,
  activeModule,
  activeModuleRoute,
  activeNavigationItem,
  collapsed,
  expandedSections,
  filterMenuByAccess,
  onMoveMenuSection,
  onQuickSearch,
  onSelectMenuItem,
  onSelectModule,
  onModuleRouteSelect,
  onToggleMenuSection,
  sectionOrder,
}: {
  accessScope: AccessScope;
  activeAmSurface?: UnifiedSurface | null;
  activeModule: AppModule;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  collapsed: boolean;
  expandedSections: Record<string, boolean>;
  filterMenuByAccess: boolean;
  onMoveMenuSection: (sectionId: string, direction: 'up' | 'down') => void;
  onQuickSearch: () => void;
  onSelectMenuItem: (item: KolamNavigationItem) => void;
  onSelectModule: (module: AppModule) => void;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
  onToggleMenuSection: (sectionId: string) => void;
  sectionOrder: string[];
}) {
  const sidebar = useMemo<SidebarProps>(
    () => ({
      accessScope,
      activeModule,
      activeModuleRoute,
      activeRoute:
        activeNavigationItem?.route ??
        getSidebarActiveRoute(activeModuleRoute) ??
        getSidebarSurfaceRoute(activeModule, activeAmSurface),
      collapsed,
      expandedSections,
      filterMenuByAccess,
      onMoveMenuSection,
      onQuickSearch,
      onSelectMenuItem,
      onSelectModule,
      onModuleRouteSelect: onModuleRouteSelect ?? (() => undefined),
      onToggleMenuSection,
      sectionOrder,
    }),
    [
      accessScope,
      activeAmSurface,
      activeModule,
      activeModuleRoute,
      activeNavigationItem,
      collapsed,
      expandedSections,
      filterMenuByAccess,
      onMoveMenuSection,
      onQuickSearch,
      onSelectMenuItem,
      onSelectModule,
      onModuleRouteSelect,
      onToggleMenuSection,
      sectionOrder,
    ],
  );

  return { sidebar };
}

function getSidebarActiveRoute(route?: ShellModuleRouteEntry | null) {
  if (!route) return null;
  if (route.route === '/') return '/';
  return `/${route.route.replace(/^\/+/, '')}`;
}

function getSidebarSurfaceRoute(
  module: AppModule,
  surface?: UnifiedSurface | null,
) {
  if (module !== 'am' || !surface?.route) return null;
  if (surface.route === '/') return '/';
  return `/${surface.route.replace(/^\/+/, '')}`;
}
