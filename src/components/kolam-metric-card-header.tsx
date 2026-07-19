import React from 'react';
import {View} from 'react-native';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {metricCardStyles as styles} from './kolam-metric-card-styles';
import type {KolamMetricCardProps} from './kolam-metric-card-types';

export function KolamMetricCardHeader({
  label,
  tone,
}: Pick<KolamMetricCardProps, 'label' | 'tone'>) {
  return (
    <KolamHeaderFrame variant="metricCard">
      <KolamCopyStack
        items={[{id: 'label', text: label, style: styles.label}]}
      />
      <View
        style={[
          styles.indicator,
          tone === 'warning' && styles.indicatorWarning,
        ]}
      />
    </KolamHeaderFrame>
  );
}