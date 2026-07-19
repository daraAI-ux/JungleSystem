import React from 'react';
import {View} from 'react-native';
import type {DashboardStatCard} from '../domain/dashboard-stats';
import {KolamDashboardMetricSparkline} from './kolam-dashboard-metric-sparkline';
import {KolamDashboardStatCardHeader} from './kolam-dashboard-stat-card-header';
import {dashboardStatCardStyles as styles} from './kolam-dashboard-stat-card-styles';
import {KolamDashboardStatChannelRows} from './kolam-dashboard-stat-channel-rows';

export function KolamDashboardStatCard({card}: {card: DashboardStatCard}) {
  return (
    <View
      style={[
        styles.metricCard,
        styles.dashboardStatMetricCard,
      ]}>
      <KolamDashboardStatCardHeader card={card} />
      <KolamDashboardMetricSparkline
        values={card.sparklineValues}
        tone={card.changeTone}
      />
      <KolamDashboardStatChannelRows
        title={card.breakdownTitle}
        channels={card.channels}
      />
    </View>
  );
}
