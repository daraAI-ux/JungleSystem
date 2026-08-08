import type { AppModule, ShellModuleRouteEntry } from '../domain/app-shell';
import type { AttentionPanelItem } from '../domain/attention-panel';
import type { AccessScope } from '../domain/auth';
import type { CommandEntry } from '../domain/command-index';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import type { SettingsTabItem } from '../domain/settings-surface';
import type { KolamChatUnreadCounts } from './use-kolam-chat-notification-host';
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
  activeSettingsTab,
  attentionItems,
  chatUnreadCounts,
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
  onAttentionItemPress,
  onAvatarPress,
  onBreadcrumbPress,
  onBreadcrumbDashboardPress,
  onChatControlPress,
  onCommandPaletteClose,
  onCommandSearchChange,
  onCommandSelect,
  onMessage,
  onMoveMenuSection,
  onModuleRouteSelect,
  onNotificationPress,
  onRefreshDataset,
  refreshLoading,
  notificationUnreadCount,
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
  timezone,
}: {
  accessScope: AccessScope;
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModule: AppModule;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
  activeSettingsTab?: SettingsTabItem | null;
  attentionItems: AttentionPanelItem[];
  chatUnreadCounts?: KolamChatUnreadCounts;
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
  onAttentionItemPress?: (item: AttentionPanelItem) => void;
  onAvatarPress: () => void;
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onChatControlPress?: ReturnType<
    typeof useKolamTopNavigationController
  >['topNavigation']['onChatControlPress'];
  onCommandPaletteClose: () => void;
  onCommandSearchChange: (search: string) => void;
  onCommandSelect: (command: CommandEntry) => Promise<void>;
  onMessage: (message: string) => void;
  onMoveMenuSection: (sectionId: string, direction: 'up' | 'down') => void;
  onModuleRouteSelect?: (route: ShellModuleRouteEntry) => void;
  onNotificationPress: () => void;
  onRefreshDataset?: () => void;
  refreshLoading?: boolean;
  notificationUnreadCount?: number;
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
      dataset,
      displayName,
      onMessage,
      onQuickSearch,
      onRefresh: onRefreshDataset,
      onRouteContext,
      onSelectModule,
      refreshLoading,
      timezone,
    });
  const { attentionCount, topNavigation } = useKolamTopNavigationController({
    activeModule,
    accessScope,
    activeAmSurface,
    activeKolamSurface,
    activeModuleRoute,
    activeNavigationItem,
    activePluginRoute,
    activeSettingsTab,
    attentionItems,
    chatUnreadCounts,
    displayInitials,
    notificationUnreadCount,
    onAvatarPress,
    onBreadcrumbPress,
    onBreadcrumbDashboardPress,
    onCashflowNavigate: onRouteContext,
    onChatControlPress,
    onNotificationPress,
    onToggleSidebar,
    profilePhotoUrl,
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
    onAttentionItemPress,
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
    activeAmSurface,
    activeModule,
    activeModuleRoute,
    activeNavigationItem,
    collapsed,
    expandedSections,
    filterMenuByAccess,
    onMoveMenuSection,
    onModuleRouteSelect,
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
