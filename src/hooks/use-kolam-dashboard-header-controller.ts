import { useMemo } from 'react';
import type { KolamAppShellSurfaceProps } from '../components/kolam-app-shell-surface';
import type { AppModule, ShellModuleRouteEntry } from '../domain/app-shell';
import { getShellModule } from '../domain/app-shell';
import type { AccessScope } from '../domain/auth';
import {
  getDashboardHeaderActions,
  getDashboardHeaderRouteContext,
  getDashboardHeaderSyncIndicator,
  getDashboardInitials,
  getDashboardSubtitle,
  getDashboardTitle,
  shouldShowDashboardSessionPill,
} from '../domain/dashboard-header';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import type { PluginRouteEntry, UnifiedSurface } from '../domain/unified';
import type { UnifiedDataset } from '../services/unified-data';

type DashboardHeaderProps = KolamAppShellSurfaceProps['dashboardHeader'];

export function useKolamDashboardHeaderController({
  accessScope,
  activeAmSurface,
  activeKolamSurface,
  activeModule,
  activeModuleRoute,
  activeNavigationItem,
  activePluginRoute,
  activeSession,
  displayName,
  dataset,
  onMessage,
  onRouteContext,
  onSelectModule,
  timezone,
}: {
  accessScope: Pick<AccessScope, 'kolam' | 'pos'>;
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModule: AppModule;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
  activeSession: UnifiedDataset['activeSession'];
  displayName: string;
  dataset: UnifiedDataset;
  onMessage: (message: string) => void;
  onRouteContext?: (route: string) => void;
  onSelectModule: (module: AppModule) => void;
  timezone?: string;
}) {
  const displayInitials = useMemo(
    () => getDashboardInitials(displayName),
    [displayName],
  );

  const dashboardHeader = useMemo<DashboardHeaderProps>(() => {
    const activeShellModule = getShellModule(activeModule);
    const activeTitle =
      activeModule === 'plugins' ? 'Plugin Hub' : activeShellModule.label;
    const routeContext = getDashboardHeaderRouteContext({
      activeAmSurface,
      activeKolamSurface,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
    });
    const eyebrow =
      routeContext?.eyebrow ??
      (activeModule === 'kolam' ? 'Beranda' : undefined);
    const isBeranda = activeModule === 'kolam' && !routeContext;

    return {
      actions: isBeranda ? getDashboardHeaderActions(accessScope) : [],
      eyebrow,
      title:
        routeContext?.title ??
        (activeModule === 'kolam'
          ? getDashboardTitle(displayName, undefined, timezone)
          : activeTitle),
      subtitle: routeContext?.subtitle ?? getDashboardSubtitle(activeTitle),
      sessionOpen: Boolean(activeSession),
      sessionCashier: activeSession?.cashier,
      syncIndicator: getDashboardHeaderSyncIndicator({
        activeModule,
        dataset,
      }),
      showSessionPill: isBeranda && shouldShowDashboardSessionPill(eyebrow),
      onSelectModule: action => {
        onSelectModule(action.targetModule);
        onRouteContext?.(action.sourceRoute);
        onMessage(`${action.label} native membuka ${action.sourceRoute}.`);
      },
    };
  }, [
    accessScope,
    activeAmSurface,
    activeKolamSurface,
    activeModule,
    activeModuleRoute,
    activeNavigationItem,
    activePluginRoute,
    activeSession,
    dataset,
    displayName,
    onMessage,
    onRouteContext,
    onSelectModule,
    timezone,
  ]);

  return { dashboardHeader, displayInitials };
}
