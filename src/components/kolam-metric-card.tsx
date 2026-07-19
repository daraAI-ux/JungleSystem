import React from 'react';
import {View} from 'react-native';
import {KolamMetricCardHeader} from './kolam-metric-card-header';
import {metricCardStyles as styles} from './kolam-metric-card-styles';
import {KolamMetricCardValue} from './kolam-metric-card-value';
import type {KolamMetricCardProps} from './kolam-metric-card-types';

export type {KolamMetricCardProps} from './kolam-metric-card-types';

export function KolamMetricCard({
  label,
  tone = 'default',
  value,
}: KolamMetricCardProps) {
  return (
    <View style={[styles.card, tone === 'warning' && styles.warning]}>
      <KolamMetricCardHeader label={label} tone={tone} />
      <KolamMetricCardValue value={value} />
    </View>
  );
}
