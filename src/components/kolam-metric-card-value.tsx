import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {metricCardStyles as styles} from './kolam-metric-card-styles';

export function KolamMetricCardValue({value}: {value: string}) {
  return (
    <KolamCopyStack items={[{id: 'value', text: value, style: styles.value}]} />
  );
}
