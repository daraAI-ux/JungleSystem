import type { AppModule, ShellModuleRouteEntry } from '../domain/app-shell';
import type { AttentionPanelItem } from '../domain/attention-panel';
import type { AccessScope } from '../domain/auth';
import type { CommandEntry } from '../domain/command-index';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import {
  getTopNavUserMenuItems,
  type TopNavBreadcrumbItem,
  type TopNavUserMenuItem,
} from '../domain/top-nav';
import type { UnifiedDataset } from '../services/unified-data';
import type { PluginRouteEntry, UnifiedSurface } from '../domain/unified';
import { useKolamDashboardHeaderController } from './use-kolam-dashboard-header-controller';
import { useKolamOverlayController } from './use-kolam-overlay-controller';
import { useKolamSidebarController } from './use-kolam-sidebar-controller';
import { useKolamTopNavigationController } from './use-kolam-top-navigation-controller';

export function useKolamShellChromeController({
  accessScope,
  activeAmSurface,
  activeKolamSurface,
  activeModule,
  activeModuleRoute,
  activeNavigationItem,
  activePluginRoute,
  activeSession,
  attentionItems,
  collapsed,
  commandSearch,
  dataset,
  commands,
  displayName,
  email,
  expandedSections,
  filterMenuByAccess,
  isAttentionOpen,
  isCommandPaletteOpen,
  isUserMenuOpen,
  onAttentionClose,
  onAvatarPress,
  onBreadcrumbPress,
  onBreadcrumbDashboardPress,
  onCommandPaletteClose,
  onCommandSearchChange,
  onCommandSelect,
  onMessage,
  onMoveMenuSection,
  onNotificationPress,
  onQuickSearch,
  onRouteContext,
  onSeeAllNotifications,
  onSelectMenuItem,
  onSelectModule,
  onSignOut,
  onToggleMenuSection,
  onToggleSidebar,
  onUserMenuClose,
  onUserMenuSelect,
  profilePhotoUrl,
  roleKey,
  sectionOrder,
  serverMetrics,
  timezone,
}: {
  accessScope: AccessScope;
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModule: AppModule;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
  activeSession: UnifiedDataset['activeSession'];
  attentionItems: AttentionPanelItem[];
  collapsed: boolean;
  commandSearch: string;
  dataset: UnifiedDataset;
  commands: CommandEntry[];
  displayName: string;
  email: string;
  expandedSections: Record<string, boolean>;
  filterMenuByAccess: boolean;
  isAttentionOpen: boolean;
  isCommandPaletteOpen: boolean;
  isUserMenuOpen: boolean;
  onAttentionClose: () => void;
  onAvatarPress: () => void;
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onCommandPaletteClose: () => void;
  onCommandSearchChange: (search: string) => void;
  onCommandSelect: (command: CommandEntry) => Promise<void>;
  onMessage: (message: string) => void;
  onMoveMenuSection: (sectionId: string, direction: 'up' | 'down') => void;
  onNotificationPress: () => void;
  onQuickSearch: () => void;
  onRouteContext?: (route: string) => void;
  onSeeAllNotifications: () => void;
  onSelectMenuItem: (item: KolamNavigationItem) => void;
  onSelectModule: (module: AppModule) => void;
  onSignOut: () => Promise<void>;
  onToggleMenuSection: (sectionId: string) => void;
  onToggleSidebar: () => void;
  onUserMenuClose: () => void;
  onUserMenuSelect: (
    item: TopNavUserMenuItem,
    onSignOut: () => Promise<void>,
  ) => Promise<void>;
  profilePhotoUrl?: string | null;
  roleKey?: string;
  sectionOrder: string[];
  serverMetrics?: ReturnType<
    typeof useKolamTopNavigationController
  >['topNavigation']['serverMetrics'];
  timezone?: string;
}) {
  const { dashboardHeader, displayInitials } =
    useKolamDashboardHeaderController({
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
    });
  const { attentionCount, topNavigation } = useKolamTopNavigationController({
    activeModule,
    activeAmSurface,
    activeKolamSurface,
    activeModuleRoute,
    activeNavigationItem,
    activePluginRoute,
    attentionItems,
    displayInitials,
    onAvatarPress,
    onBreadcrumbPress,
    onBreadcrumbDashboardPress,
    onNotificationPress,
    onToggleSidebar,
    profilePhotoUrl,
    serverMetrics,
  });
  const { overlay } = useKolamOverlayController({
    accessScope,
    attentionCount,
    attentionItems,
    commandSearch,
    commands,
    displayInitials,
    displayName,
    email,
    isAttentionOpen,
    isCommandPaletteOpen,
    isUserMenuOpen,
    onAttentionClose,
    onCommandPaletteClose,
    onCommandSearchChange,
    onCommandSelect,
    onSeeAllNotifications,
    onSignOut,
    onUserMenuClose,
    onUserMenuSelect,
    profilePhotoUrl,
    userMenuItems: getTopNavUserMenuItems(roleKey),
  });
  const { sidebar } = useKolamSidebarController({
    accessScope,
    activeModule,
    activeNavigationItem,
    collapsed,
    expandedSections,
    filterMenuByAccess,
    onMoveMenuSection,
    onQuickSearch,
    onSelectMenuItem,
    onSelectModule,
    onToggleMenuSection,
    sectionOrder,
  });

  return {
    dashboardHeader,
    overlay,
    sidebar,
    topNavigation,
  };
}
