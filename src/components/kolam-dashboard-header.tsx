import React from 'react';
import { View } from 'react-native';
import {
  type DashboardHeaderAction,
  type DashboardHeaderSyncIndicator,
} from '../domain/dashboard-header';
import { KolamDashboardHeaderActions } from './kolam-dashboard-header-actions';
import { KolamDashboardHeaderCopy } from './kolam-dashboard-header-copy';
import { KolamDashboardSessionPill } from './kolam-dashboard-session-pill';
import { KolamDashboardSyncIndicatorBadge } from './kolam-dashboard-sync-indicator-badge';
import { KolamHeaderFrame } from './kolam-header-frame';
import { dashboardHeaderStyles as styles } from './kolam-dashboard-header-styles';

export function KolamDashboardHeader({
  actions,
  eyebrow,
  onSelectModule,
  sessionCashier,
  sessionOpen,
  showSessionPill,
  subtitle,
  syncIndicator,
  title,
}: {
  actions: DashboardHeaderAction[];
  eyebrow?: string;
  onSelectModule: (action: DashboardHeaderAction) => void;
  sessionCashier?: string;
  sessionOpen: boolean;
  showSessionPill: boolean;
  subtitle: string;
  syncIndicator: DashboardHeaderSyncIndicator;
  title: string;
}) {
  return (
    <KolamHeaderFrame variant="dashboardHeader">
      <KolamDashboardHeaderCopy
        eyebrow={eyebrow}
        subtitle={subtitle}
        title={title}
      />
      <View style={styles.headerControls}>
        <KolamDashboardSyncIndicatorBadge indicator={syncIndicator} />
        <KolamDashboardHeaderActions
          actions={actions}
          onSelectModule={onSelectModule}
        />
        {showSessionPill ? (
          <KolamDashboardSessionPill
            sessionCashier={sessionCashier}
            sessionOpen={sessionOpen}
          />
        ) : null}
      </View>
    </KolamHeaderFrame>
  );
}
