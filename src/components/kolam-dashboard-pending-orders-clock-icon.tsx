import React from 'react';
import {View} from 'react-native';
import {pendingOrdersStyles as styles} from './kolam-dashboard-pending-orders-styles';

export function KolamDashboardPendingOrdersClockIcon() {
  return (
    <View style={styles.pendingOrdersClockIcon}>
      <View style={styles.pendingOrdersClockHandHour} />
      <View style={styles.pendingOrdersClockHandMinute} />
    </View>
  );
}
