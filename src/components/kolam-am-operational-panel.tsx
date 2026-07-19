import React from 'react';
import {getAmDeviceRows, getAmOperationRows} from '../lib/unified-summary';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamListFrame} from './kolam-list-frame';
import {KolamOperationalEmpty} from './kolam-operational-empty';
import {KolamSummaryBlock} from './kolam-summary-block';
import {getAmStatusText} from './kolam-unified-status-text';

export function KolamAmOperationalPanel({dataset}: {dataset: UnifiedDataset}) {
  const operationRows = getAmOperationRows(dataset.am);
  const deviceRows = getAmDeviceRows(dataset.am);

  if (!operationRows.length && !deviceRows.length) {
    return (
      <KolamOperationalEmpty
        title="Dashboard AM belum live"
        message={getAmStatusText(dataset)}
      />
    );
  }

  return (
    <KolamListFrame variant="operationalGrid">
      <KolamSummaryBlock title="Operasi AM" rows={operationRows} />
      <KolamSummaryBlock
        title="Device"
        rows={deviceRows}
        emptyText="Device belum tersedia."
      />
    </KolamListFrame>
  );
}