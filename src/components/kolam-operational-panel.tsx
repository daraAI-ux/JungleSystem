import React from 'react';
import {
  getDashboardPendingOrders,
  getDashboardPendingOrdersDescriptor,
} from '../domain/dashboard-pending-orders';
import {getDashboardSalesGraph} from '../domain/dashboard-sales-graph';
import {getKolamFinanceRows, getKolamWalletRows} from '../lib/unified-summary';
import type {UnifiedDataset} from '../services/unified-data';
import {
  KolamDashboardPendingOrders,
  KolamDashboardSalesGraphCard,
} from './kolam-dashboard-widgets';
import {KolamListFrame} from './kolam-list-frame';
import {KolamOperationalEmpty} from './kolam-operational-empty';
import {KolamSummaryBlock} from './kolam-summary-block';
import {getKolamStatusText} from './kolam-unified-status-text';

export function KolamOperationalPanel({dataset}: {dataset: UnifiedDataset}) {
  const financeRows = getKolamFinanceRows(dataset.kolam);
  const walletRows = getKolamWalletRows(dataset.kolam);
  const pendingOrdersDescriptor = getDashboardPendingOrdersDescriptor();
  const pendingOrdersPanel = getDashboardPendingOrders(dataset);
  const salesGraph = getDashboardSalesGraph(dataset);

  if (
    !financeRows.length &&
    !walletRows.length &&
    !salesGraph.points.length &&
    !pendingOrdersPanel.sections.length
  ) {
    return (
      <KolamOperationalEmpty
        title="Ringkasan Kolam belum live"
        message={getKolamStatusText(dataset)}
      />
    );
  }

  return (
    <KolamListFrame variant="operationalStack">
      <KolamListFrame variant="operationalGrid">
        <KolamSummaryBlock title="Finance" rows={financeRows} />
        <KolamSummaryBlock
          title="Wallet"
          rows={walletRows}
          emptyText="Wallet belum tersedia."
        />
      </KolamListFrame>
      <KolamDashboardSalesGraphCard graph={salesGraph} />
      <KolamDashboardPendingOrders
        descriptor={pendingOrdersDescriptor}
        panel={pendingOrdersPanel}
      />
    </KolamListFrame>
  );
}
