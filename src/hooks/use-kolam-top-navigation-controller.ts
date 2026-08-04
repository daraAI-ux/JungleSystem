import { useMemo } from 'react';
import type { KolamAppShellSurfaceProps } from '../components/kolam-app-shell-surface';
import type { AppModule, ShellModuleRouteEntry } from '../domain/app-shell';
import type { AttentionPanelItem } from '../domain/attention-panel';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import type { SettingsTabItem } from '../domain/settings-surface';
import type { KolamChatUnreadCounts } from './use-kolam-chat-notification-host';
import type { AccessScope } from '../domain/auth';
import {
  getTopNavBreadcrumbItems,
  getTopNavRightControls,
  type TopNavBreadcrumbItem,
} from '../domain/top-nav';
import type { PluginRouteEntry, UnifiedSurface } from '../domain/unified';

type TopNavigationProps = KolamAppShellSurfaceProps['topNavigation'];

export function useKolamTopNavigationController({
  activeModule,
  activeAmSurface,
  activeKolamSurface,
  activeModuleRoute,
  activeNavigationItem,
  activePluginRoute,
  activeSettingsTab,
  accessScope,
  attentionItems,
  chatUnreadCounts,
  displayInitials,
  notificationUnreadCount,
  onAvatarPress,
  onBreadcrumbPress,
  onBreadcrumbDashboardPress,
  onCashflowNavigate,
  onChatControlPress,
  onNotificationPress,
  onToggleSidebar,
  profilePhotoUrl,
}: {
  activeModule: AppModule;
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
  activeSettingsTab?: SettingsTabItem | null;
  accessScope?: Pick<AccessScope, 'kolam'>;
  attentionItems: AttentionPanelItem[];
  chatUnreadCounts?: KolamChatUnreadCounts;
  displayInitials: string;
  notificationUnreadCount?: number;
  onAvatarPress: () => void;
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onCashflowNavigate?: TopNavigationProps['onCashflowNavigate'];
  onChatControlPress?: TopNavigationProps['onChatControlPress'];
  onNotificationPress: () => void;
  onToggleSidebar: () => void;
  profilePhotoUrl?: string | null;
}) {
  const attentionCount = useMemo(
    () =>
      typeof notificationUnreadCount === 'number'
        ? Math.max(0, notificationUnreadCount)
        : attentionItems.filter(item => item.id !== 'all-clear').length,
    [attentionItems, notificationUnreadCount],
  );

  const topNavigation = useMemo<TopNavigationProps>(
    () => ({
      attentionCount,
      breadcrumbItems: getTopNavBreadcrumbItems(activeModule, {
        activeAmSurface,
        activeKolamSurface,
        activeModuleRoute,
        activeNavigationItem,
        activePluginRoute,
        activeSettingsTab,
      }),
      chatUnreadCounts,
      displayInitials,
      rightControls: getTopNavRightControls(accessScope),
      onAvatarPress,
      onBreadcrumbPress,
      onBreadcrumbDashboardPress,
      onCashflowNavigate,
      onChatControlPress,
      onNotificationPress,
      onToggleSidebar,
      profilePhotoUrl,
    }),
    [
      activeModule,
      activeAmSurface,
      activeKolamSurface,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
      activeSettingsTab,
      accessScope,
      attentionCount,
      chatUnreadCounts,
      displayInitials,
      onAvatarPress,
      onBreadcrumbPress,
      onBreadcrumbDashboardPress,
      onCashflowNavigate,
      onChatControlPress,
      onNotificationPress,
      onToggleSidebar,
      profilePhotoUrl,
    ],
  );

  return { attentionCount, topNavigation };
}
