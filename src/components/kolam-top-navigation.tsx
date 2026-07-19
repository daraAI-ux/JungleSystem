import React from 'react';
import { KolamShellFrame } from './kolam-shell-frame';
import { KolamTopNavigationLeft } from './kolam-top-navigation-left';
import { KolamTopNavigationRight } from './kolam-top-navigation-right';
import { KolamServerMetricsStrip } from './kolam-server-metrics-strip';
import type { KolamTopNavigationProps } from './kolam-top-navigation-types';

export function KolamTopNavigation({
  attentionCount,
  breadcrumbItems,
  displayInitials,
  onAvatarPress,
  onBreadcrumbPress,
  onBreadcrumbDashboardPress,
  onNotificationPress,
  onToggleSidebar,
  profilePhotoUrl,
  rightControls,
  serverMetrics,
}: KolamTopNavigationProps) {
  return (
    <KolamShellFrame variant="topNavigation">
      <KolamTopNavigationLeft
        breadcrumbItems={breadcrumbItems}
        onBreadcrumbPress={onBreadcrumbPress}
        onBreadcrumbDashboardPress={onBreadcrumbDashboardPress}
        onToggleSidebar={onToggleSidebar}
      />
      {serverMetrics ? <KolamServerMetricsStrip {...serverMetrics} /> : null}
      <KolamTopNavigationRight
        attentionCount={attentionCount}
        displayInitials={displayInitials}
        onAvatarPress={onAvatarPress}
        onNotificationPress={onNotificationPress}
        profilePhotoUrl={profilePhotoUrl}
        rightControls={rightControls}
      />
    </KolamShellFrame>
  );
}
