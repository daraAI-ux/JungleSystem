import React, {createContext, useContext} from 'react';
import type {KolamGlobalChatRailMode} from '../components/kolam-global-chat-rail';
import type {KolamAppShellSurfaceProps} from '../components/kolam-app-shell-surface';
import type {KolamRuntimeSurfaceProps} from '../components/kolam-runtime-surface';
import type {KolamWorkspaceSurfaceProps} from '../components/kolam-workspace-surface';
import type {AppModule, ShellModuleRouteEntry} from '../domain/app-shell';
import type {AccessScope, AuthSource} from '../domain/auth';
import type {KolamNavigationItem} from '../domain/kolam-navigation';
import type {KolamWorkspaceTab} from '../domain/kolam-workspace-tabs';
import type {SettingsTabItem} from '../domain/settings-surface';
import type {SyncActivityEntry} from '../domain/sync-activity';
import type {PluginRouteEntry, UnifiedSurface} from '../domain/unified';
import type {SignedInUser} from '../services/auth-api';
import type {
  KolamDashboardRange,
  UnifiedDataset,
} from '../services/unified-data';
import type {RefreshUnifiedDatasetInput} from '../hooks/use-kolam-unified-data-controller';
import type {useKolamNativeDeviceIdentity} from '../hooks/use-kolam-native-device-identity';

export type KolamAuthContextValue = {
  accessScope: AccessScope;
  authEmail: string;
  authMessage: string;
  authPassword: string;
  authSource: AuthSource;
  authSourceHint: string;
  authUser: SignedInUser | null;
  deviceIdentityStatus: ReturnType<typeof useKolamNativeDeviceIdentity>;
  displayName: string;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  isSigningIn: boolean;
  setAuthEmail: (value: string) => void;
  setAuthMessage: (value: string) => void;
  setAuthPassword: (value: string) => void;
  setAuthSource: (value: AuthSource) => void;
};

export type KolamDataContextValue = {
  amApiBaseUrl: string;
  dataset: UnifiedDataset;
  isLoadingDataset: boolean;
  kolamDashboardRange: KolamDashboardRange;
  refreshDataset: (
    preferLiveApi: boolean,
    enabledAreas?: AccessScope,
    nextKolamDashboardRange?: KolamDashboardRange,
  ) => Promise<void>;
  refreshUnifiedDataset: (
    input: RefreshUnifiedDatasetInput,
  ) => Promise<UnifiedDataset>;
  setAmApiBaseUrl: (value: string) => void;
  setDataset: React.Dispatch<React.SetStateAction<UnifiedDataset>>;
  setKolamDashboardRange: (value: KolamDashboardRange) => void;
  syncActivity: SyncActivityEntry[];
};

export type KolamNavigationContextValue = {
  activeAmSurface?: UnifiedSurface | null;
  activeChatRail: KolamGlobalChatRailMode | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModule: AppModule;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
  activeSettingsTab: SettingsTabItem | null;
  handleAmSurfaceSelect: (surface: UnifiedSurface) => void;
  handleChatRailClose: () => void;
  handleDashboardRouteContext: (route: string) => void;
  handleKolamSurfaceSelect: (surface: UnifiedSurface) => void;
  handleModuleRouteSelect: (route: ShellModuleRouteEntry) => void;
  handleModuleSelect: (module: AppModule) => void;
  handlePluginRouteSelect: (route: PluginRouteEntry) => void;
  setActiveSettingsTab: React.Dispatch<
    React.SetStateAction<SettingsTabItem | null>
  >;
  setPluginSearch: (search: string) => void;
};

export type KolamShellChromeContextValue = {
  dashboardHeader: KolamAppShellSurfaceProps['dashboardHeader'];
  overlay: KolamAppShellSurfaceProps['overlay'];
  rightRail: KolamAppShellSurfaceProps['rightRail'];
  sidebar: KolamAppShellSurfaceProps['sidebar'];
  topNavigation: KolamAppShellSurfaceProps['topNavigation'];
  workspaceTabs: KolamAppShellSurfaceProps['workspaceTabs'];
};

export type KolamWorkspaceViewContextValue = {
  runtime: KolamRuntimeSurfaceProps;
  workspace: Omit<KolamWorkspaceSurfaceProps, 'runtime'> & {
    runtime?: KolamRuntimeSurfaceProps;
  };
};

export type KolamWorkspaceTabsContextValue = {
  activeTabId: string;
  tabs: KolamWorkspaceTab[];
};

export const KolamAuthContext = createContext<KolamAuthContextValue | null>(
  null,
);
export const KolamDataContext = createContext<KolamDataContextValue | null>(
  null,
);
export const KolamNavigationContext =
  createContext<KolamNavigationContextValue | null>(null);
export const KolamShellChromeContext =
  createContext<KolamShellChromeContextValue | null>(null);
export const KolamWorkspaceViewContext =
  createContext<KolamWorkspaceViewContextValue | null>(null);
export const KolamWorkspaceTabsContext =
  createContext<KolamWorkspaceTabsContextValue | null>(null);

function requireContext<T>(value: T | null, label: string): T {
  if (!value) {
    throw new Error(`${label} must be used within KolamAppStateProvider`);
  }
  return value;
}

export function useKolamAuthContext() {
  return requireContext(useContext(KolamAuthContext), 'useKolamAuthContext');
}

export function useKolamDataContext() {
  return requireContext(useContext(KolamDataContext), 'useKolamDataContext');
}

export function useKolamNavigationContext() {
  return requireContext(
    useContext(KolamNavigationContext),
    'useKolamNavigationContext',
  );
}

export function useKolamShellChromeContext() {
  return requireContext(
    useContext(KolamShellChromeContext),
    'useKolamShellChromeContext',
  );
}

export function useKolamWorkspaceViewContext() {
  return requireContext(
    useContext(KolamWorkspaceViewContext),
    'useKolamWorkspaceViewContext',
  );
}

export function useKolamWorkspaceTabsContext() {
  return requireContext(
    useContext(KolamWorkspaceTabsContext),
    'useKolamWorkspaceTabsContext',
  );
}
