import React from 'react';
import { View } from 'react-native';
import type { TopNavBreadcrumbItem } from '../domain/top-nav';
import { KolamListFrame } from './kolam-list-frame';
import {KolamQuickSearch} from './kolam-quick-search';
import { KolamSidebarTrigger } from './kolam-sidebar-trigger';
import { topNavigationStyles as styles } from './kolam-top-navigation-styles';

export function KolamTopNavigationLeft({
  onQuickSearch,
  onToggleSidebar,
}: {
  breadcrumbItems: TopNavBreadcrumbItem[];
  onBreadcrumbPress?: (item: TopNavBreadcrumbItem) => void;
  onBreadcrumbDashboardPress: () => void;
  onQuickSearch?: () => void;
  onToggleSidebar: () => void;
}) {
  return (
    <KolamListFrame variant="topNavLeft">
      <KolamSidebarTrigger onPress={onToggleSidebar} />
      <View style={styles.topNavSeparator} />
      {onQuickSearch ? (
        <KolamQuickSearch onPress={onQuickSearch} variant="topNav" />
      ) : null}
    </KolamListFrame>
  );
}
