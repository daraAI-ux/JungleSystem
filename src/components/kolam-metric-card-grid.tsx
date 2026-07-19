import React from 'react';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamMetricGridCard} from './kolam-metric-grid-card';
import type {KolamMetricCardGridProps} from './kolam-metric-card-grid-types';

export type {
  KolamMetricCardGridProps,
  KolamMetricCardItem,
} from './kolam-metric-card-grid-types';

export function KolamMetricCardGrid({
  accessibilityLabel,
  items,
}: KolamMetricCardGridProps) {
  return (
    <KolamListFrame variant="metric" accessibilityLabel={accessibilityLabel}>
      <KolamMappedList
        items={items}
        getKey={item => item.id}
        renderItem={item => <KolamMetricGridCard item={item} />}
      />
    </KolamListFrame>
  );
}
