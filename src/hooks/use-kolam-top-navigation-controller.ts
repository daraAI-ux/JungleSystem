import { useMemo } from 'react';
import type { KolamAppShellSurfaceProps } from '../components/kolam-app-shell-surface';
import type { AppModule, ShellModuleRouteEntry } from '../domain/app-shell';
import type { AttentionPanelItem } from '../domain/attention-panel';
import type { KolamNavigationItem } from '../domain/kolam-navigation';
import type { SettingsTabItem } from '../domain/settings-surface';
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
  attentionItems,
  displayInitials,
  onAvatarPress,
  onBreadcrumbPress,
  onBreadcrumbDashboardPress,
  onChatControlPress,
  onNotificationPress,
  onToggleSidebar,
  profilePhotoUrl,
  serverMetrics,
}: {
  activeModule: AppModule;
  activeAmSurface?: UnifiedSurface | null;
  activeKolamSurface?: UnifiedSurface | null;
  activeModuleRoute?: ShellModuleRouteEntry | null;
  activeNavigationItem?: KolamNavigationItem | null;
  activePluginRoute?: PluginRouteEntry | null;
  activeSettingsTab?: SettingsTabItem | null;
  attentionItems: AttentionPanelItem[];
  displayInitials: string;
  onAvatarPress: () => void;
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onChatControlPress?: TopNavigationProps['onChatControlPress'];
  onNotificationPress: () => void;
  onToggleSidebar: () => void;
  profilePhotoUrl?: string | null;
  serverMetrics?: TopNavigationProps['serverMetrics'];
}) {
  const attentionCount = useMemo(
    () => attentionItems.filter(item => item.id !== 'all-clear').length,
    [attentionItems],
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
      displayInitials,
      rightControls: getTopNavRightControls(),
      onAvatarPress,
      onBreadcrumbPress,
      onBreadcrumbDashboardPress,
      onChatControlPress,
      onNotificationPress,
      onToggleSidebar,
      profilePhotoUrl,
      serverMetrics,
    }),
    [
      activeModule,
      activeAmSurface,
      activeKolamSurface,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
      activeSettingsTab,
      attentionCount,
      displayInitials,
      onAvatarPress,
      onBreadcrumbPress,
      onBreadcrumbDashboardPress,
      onChatControlPress,
      onNotificationPress,
      onToggleSidebar,
      profilePhotoUrl,
      serverMetrics,
    ],
  );

  return { attentionCount, topNavigation };
}
