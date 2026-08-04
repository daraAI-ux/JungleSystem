import type {AppModule, ShellModuleRouteEntry} from './app-shell';
import {getShellModule} from './app-shell';
import type {KolamNavigationItem} from './kolam-navigation';
import type {SettingsTabItem} from './settings-surface';
import type {PluginRouteEntry, UnifiedSurface} from './unified';

export interface KolamWorkspaceTabSnapshot {
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModule: AppModule;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
  activeSettingsTab?: SettingsTabItem | null;
}

export interface KolamWorkspaceTab {
  id: string;
  label: string;
  snapshot: KolamWorkspaceTabSnapshot;
}

export function getKolamWorkspaceTabLabel(
  snapshot: KolamWorkspaceTabSnapshot,
): string {
  if (snapshot.activeNavigationItem?.label) {
    return snapshot.activeNavigationItem.label;
  }

  if (snapshot.activePluginRoute?.pluginLabel) {
    return snapshot.activePluginRoute.pluginLabel;
  }

  if (snapshot.activeKolamSurface?.label) {
    return snapshot.activeKolamSurface.label;
  }

  if (snapshot.activeAmSurface?.label) {
    return snapshot.activeAmSurface.label;
  }

  if (snapshot.activeModuleRoute?.moduleLabel) {
    return snapshot.activeModuleRoute.moduleLabel;
  }

  return getShellModule(snapshot.activeModule).label;
}

export function getKolamWorkspaceTabRouteKey(
  snapshot: KolamWorkspaceTabSnapshot,
): string {
  const route =
    snapshot.activeNavigationItem?.route ??
    snapshot.activePluginRoute?.route ??
    snapshot.activeKolamSurface?.route ??
    snapshot.activeAmSurface?.route ??
    snapshot.activeModuleRoute?.route ??
    '/';

  return `${snapshot.activeModule}:${route}`;
}
