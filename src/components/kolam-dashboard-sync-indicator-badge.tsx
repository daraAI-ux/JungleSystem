import React from 'react';
import { View } from 'react-native';
import type { DashboardHeaderSyncIndicator } from '../domain/dashboard-header';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamStatusIndicatorIcon } from './kolam-status-indicator-icon';
import {
  getStatusIndicatorIconKind,
  getSyncActivityStatusIconColor,
} from './kolam-status-indicator-utils';
import { dashboardHeaderStyles as styles } from './kolam-dashboard-header-styles';

export function KolamDashboardSyncIndicatorBadge({
  indicator,
}: {
  indicator: DashboardHeaderSyncIndicator;
}) {
  return (
    <View
      accessibilityLabel={indicator.detail}
      style={styles.syncIndicatorBadge}
    >
      <KolamStatusBadge
        icon={
          <KolamStatusIndicatorIcon
            color={getSyncActivityStatusIconColor(indicator.intent)}
            kind={getStatusIndicatorIconKind(indicator.statusIconKind)}
          />
        }
        intent={indicator.intent}
        label={indicator.label}
      />
    </View>
  );
}
