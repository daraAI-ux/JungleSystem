import React from 'react';
import {View} from 'react-native';
import { KolamShellFrame } from './kolam-shell-frame';
import { KolamTopNavigationLeft } from './kolam-top-navigation-left';
import { KolamTopNavigationRight } from './kolam-top-navigation-right';
import { KolamServerMetricsStripHost } from './kolam-server-metrics-strip-host';
import {topNavigationStyles as styles} from './kolam-top-navigation-styles';
import type { KolamTopNavigationProps } from './kolam-top-navigation-types';

export function KolamTopNavigation({
  attentionCount,
  breadcrumbItems,
  displayInitials,
  onAvatarPress,
  onBreadcrumbPress,
  onBreadcrumbDashboardPress,
  onCashflowNavigate,
  onChatControlPress,
  onNotificationPress,
  onToggleSidebar,
  profilePhotoUrl,
  rightControls,
}: KolamTopNavigationProps) {
  return (
    <KolamShellFrame variant="topNavigation">
      <KolamTopNavigationLeft
        breadcrumbItems={breadcrumbItems}
        onBreadcrumbPress={onBreadcrumbPress}
        onBreadcrumbDashboardPress={onBreadcrumbDashboardPress}
        onToggleSidebar={onToggleSidebar}
      />
      <View style={styles.metricsHost}>
        <KolamServerMetricsStripHost />
      </View>
      <KolamTopNavigationRight
        attentionCount={attentionCount}
        displayInitials={displayInitials}
        onAvatarPress={onAvatarPress}
        onCashflowNavigate={onCashflowNavigate}
        onChatControlPress={onChatControlPress}
        onNotificationPress={onNotificationPress}
        profilePhotoUrl={profilePhotoUrl}
        rightControls={rightControls}
      />
    </KolamShellFrame>
  );
}
