import React from 'react';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {metricCardGridStyles as styles} from './kolam-metric-card-grid-styles';
import type {KolamMetricCardItem} from './kolam-metric-card-grid-types';

export function KolamMetricGridCard({item}: {item: KolamMetricCardItem}) {
  return (
    <KolamCardFrame variant="metricGrid">
      <KolamCopyStack
        items={[
          {id: 'label', text: item.label, style: styles.label},
          {id: 'value', text: item.value, style: styles.value},
        ]}
      />
    </KolamCardFrame>
  );
}
