import React from 'react';
import {KolamMetricCardGrid} from './kolam-metric-card-grid';

export function KolamSettingsMetricsGrid({
  stats,
}: {
  stats: {total: number; nativeSummary: number; sourceAudit: number};
}) {
  return (
    <KolamMetricCardGrid
      accessibilityLabel="settings surface metrics"
      items={[
        {id: 'routes', label: 'Routes', value: stats.total},
        {
          id: 'native-summary',
          label: 'Native Summary',
          value: stats.nativeSummary,
        },
        {
          id: 'source-audit',
          label: 'Source Audit',
          value: stats.sourceAudit,
        },
      ]}
    />
  );
}
