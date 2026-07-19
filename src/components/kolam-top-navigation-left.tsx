import React from 'react';
import { View } from 'react-native';
import type { TopNavBreadcrumbItem } from '../domain/top-nav';
import { KolamBreadcrumbTrail } from './kolam-breadcrumb-trail';
import { KolamListFrame } from './kolam-list-frame';
import { KolamSidebarTrigger } from './kolam-sidebar-trigger';
import { topNavigationStyles as styles } from './kolam-top-navigation-styles';

export function KolamTopNavigationLeft({
  breadcrumbItems,
  onBreadcrumbPress,
  onBreadcrumbDashboardPress,
  onToggleSidebar,
}: {
  breadcrumbItems: TopNavBreadcrumbItem[];
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onToggleSidebar: () => void;
}) {
  return (
    <KolamListFrame variant="topNavLeft">
      <KolamSidebarTrigger onPress={onToggleSidebar} />
      <View style={styles.topNavSeparator} />
      <KolamBreadcrumbTrail
        breadcrumbItems={breadcrumbItems}
        onBreadcrumbPress={onBreadcrumbPress}
        onBreadcrumbDashboardPress={onBreadcrumbDashboardPress}
      />
    </KolamListFrame>
  );
}
