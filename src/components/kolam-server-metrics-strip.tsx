import React from 'react';
import {
  formatServerMetricPercent,
  getServerMetricDisplayItems,
  type ServerMetricDisplayItem,
} from '../domain/server-metrics';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamStatusBadge, type KolamStatusBadgeIntent} from './kolam-status-badge';
import {serverMetricsStripStyles as styles} from './kolam-server-metrics-strip-styles';
import type {KolamServerMetricsStripProps} from './kolam-server-metrics-strip-types';

export type {KolamServerMetricsStripProps};

export function KolamServerMetricsStrip({
  errorMessage,
  loading,
  snapshot,
}: KolamServerMetricsStripProps) {
  const items = snapshot ? getServerMetricDisplayItems(snapshot) : [];

  if (!items.length) {
    return (
      <KolamListFrame
        accessibilityLabel="server metrics"
        variant="wrap"
        style={styles.strip}>
        <KolamStatusBadge
          intent={errorMessage ? 'danger' : 'muted'}
          label={loading ? 'Server ...' : errorMessage ? 'Server down' : 'Server --'}
          numberOfLines={1}
          style={styles.badge}
          textStyle={styles.text}
        />
      </KolamListFrame>
    );
  }

  return (
    <KolamListFrame
      accessibilityLabel="server metrics"
      variant="wrap"
      style={styles.strip}>
      <KolamMappedList
        items={items}
        getKey={item => item.id}
        renderItem={item => (
          <KolamStatusBadge
            intent={getMetricIntent(item)}
            label={`${item.label} ${formatServerMetricPercent(item.value)}`}
            numberOfLines={1}
            style={styles.badge}
            textStyle={styles.text}
          />
        )}
      />
    </KolamListFrame>
  );
}

function getMetricIntent(item: ServerMetricDisplayItem): KolamStatusBadgeIntent {
  const value = item.value;
  if (typeof value !== 'number') {
    return 'muted';
  }

  if (value >= 90) {
    return 'danger';
  }

  if (value >= 75) {
    return 'warning';
  }

  return 'success';
}
