import React from 'react';
import type {AppArea} from '../domain/app-shell';
import {getRouteDataPreviewCards} from '../domain/route-data-preview';
import {getRouteWorkbenchModel} from '../domain/route-workbench';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamEndpointList} from './kolam-endpoint-list';
import {KolamSummaryCardList} from './kolam-summary-card-list';

export function KolamRouteWorkbench({
  area,
  dataset,
  description,
  label,
  route,
  sourceRepo,
}: {
  area: AppArea;
  dataset: UnifiedDataset;
  description: string;
  label: string;
  route: string;
  sourceRepo: string;
}) {
  const model = getRouteWorkbenchModel({
    area,
    dataSnapshot: getRouteDataSnapshot(area, dataset),
    description,
    label,
    route,
    sourceRepo,
    syncState: getRouteSyncState(area, dataset),
  });
  const previewCards = getRouteDataPreviewCards({
    area,
    dataset,
    intent: model.intent,
  });

  return (
    <>
      <KolamSummaryCardList
        accessibilityLabel={`${label} route workbench summary`}
        items={model.summary}
        variant="compact"
      />
      <KolamDescriptionList
        accessibilityLabel={`${label} route workbench details`}
        rows={model.rows}
      />
      <KolamSummaryCardList
        accessibilityLabel={`${label} route runtime preview`}
        items={previewCards}
        variant="compact"
      />
      <KolamEndpointList
        accessibilityLabel={`${label} route workbench targets`}
        endpoints={model.targets}
      />
    </>
  );
}

function getRouteDataSnapshot(area: AppArea, dataset: UnifiedDataset) {
  if (area === 'am') {
    const dashboard = dataset.am.dashboard;

    if (!dashboard) {
      return 'AM dashboard menunggu data live dari server.';
    }

    return `${dashboard.summary.totalAccounts} account / ${dashboard.summary.activeDevices} device aktif`;
  }

  if (area === 'plugins') {
    return `${dataset.sync.kolam} Kolam / ${dataset.sync.am} AM / ${dataset.sync.pos} POS`;
  }

  if (area === 'pos') {
    return `${dataset.catalog.length} item / ${dataset.recentSales.length} sales / ${dataset.paymentMethods.length} payment`;
  }

  const summaryCount = dataset.kolam.dashboardSummary.length;
  const graphCount = dataset.kolam.salesGraph.length;

  return `${summaryCount} dashboard summary / ${graphCount} graph point / ${dataset.customers.length} customer`;
}

function getRouteSyncState(area: AppArea, dataset: UnifiedDataset) {
  if (area === 'am') {
    return dataset.sync.am;
  }

  if (area === 'pos') {
    return dataset.sync.pos;
  }

  return dataset.sync.kolam;
}
