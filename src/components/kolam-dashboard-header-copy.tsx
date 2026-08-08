import React from 'react';
import {View} from 'react-native';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';
import {KolamCopyStack} from './kolam-copy-stack';
import {dashboardHeaderStyles as styles} from './kolam-dashboard-header-styles';
import {KolamModuleIcon} from './kolam-module-icon';
import {KolamQuickSearch} from './kolam-quick-search';

export function KolamDashboardHeaderCopy({
  moduleIcon,
  onQuickSearch,
  subtitle,
  title,
}: {
  moduleIcon?: KolamNavigationModuleIcon;
  onQuickSearch?: () => void;
  subtitle?: string;
  title: string;
}) {
  const items = [
    {id: 'title', text: title, style: styles.title},
    ...(subtitle
      ? [{id: 'subtitle', text: subtitle, style: styles.headerSubtitle}]
      : []),
  ];

  return (
    <View
      style={[
        styles.headerCopy,
        moduleIcon ? styles.headerCopyWithIcon : null,
      ]}>
      {moduleIcon ? <KolamModuleIcon kind={moduleIcon} size="header" /> : null}
      <View style={moduleIcon ? styles.headerCopyText : undefined}>
        {onQuickSearch ? (
          <KolamQuickSearch onPress={onQuickSearch} variant="header" />
        ) : null}
        <KolamCopyStack items={items} />
      </View>
    </View>
  );
}
