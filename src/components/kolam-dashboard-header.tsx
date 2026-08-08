import React from 'react';
import { View } from 'react-native';
import {
  type DashboardHeaderAction,
  type DashboardHeaderSyncIndicator,
} from '../domain/dashboard-header';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';
import { KolamDashboardHeaderActions } from './kolam-dashboard-header-actions';
import { KolamDashboardHeaderCopy } from './kolam-dashboard-header-copy';
import { KolamDashboardSyncIndicatorBadge } from './kolam-dashboard-sync-indicator-badge';
import { KolamHeaderFrame } from './kolam-header-frame';
import {KolamRefreshButton} from './kolam-refresh-button';
import { dashboardHeaderStyles as styles } from './kolam-dashboard-header-styles';

export function KolamDashboardHeader({
  actions,
  moduleIcon,
  onQuickSearch,
  onSelectModule,
  onRefresh,
  refreshLoading = false,
  subtitle,
  syncIndicator,
  title,
}: {
  actions: DashboardHeaderAction[];
  eyebrow?: string;
  moduleIcon?: KolamNavigationModuleIcon;
  onQuickSearch?: () => void;
  onSelectModule: (action: DashboardHeaderAction) => void;
  onRefresh?: () => void;
  refreshLoading?: boolean;
  subtitle: string;
  syncIndicator: DashboardHeaderSyncIndicator;
  title: string;
}) {
  return (
    <KolamHeaderFrame variant="dashboardHeader">
      <KolamDashboardHeaderCopy
        moduleIcon={moduleIcon}
        onQuickSearch={onQuickSearch}
        subtitle={subtitle}
        title={title}
      />
      <View style={styles.headerControls}>
        <View style={styles.headerSyncControls}>
          <KolamDashboardSyncIndicatorBadge indicator={syncIndicator} />
          {onRefresh ? (
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={refreshLoading}
              loading={refreshLoading}
              loadingLabel="Refreshing..."
              onPress={onRefresh}
              style={styles.headerRefreshButton}
            />
          ) : null}
        </View>
        <KolamDashboardHeaderActions
          actions={actions}
          onSelectModule={onSelectModule}
        />
      </View>
    </KolamHeaderFrame>
  );
}
