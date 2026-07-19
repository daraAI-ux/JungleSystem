import React from 'react';
import {appConfig} from '../config/app';
import type {AppArea} from '../domain/app-shell';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamDescriptionList} from './kolam-description-list';

export function KolamRouteContractPanel({
  area,
  dataset,
  evidence,
  route,
  sourceRepo,
}: {
  area: AppArea;
  dataset: UnifiedDataset;
  evidence: string;
  route: string;
  sourceRepo: string;
}) {
  const runtime = getRuntimeContract(area);

  return (
    <KolamDescriptionList
      accessibilityLabel={`${route} native route contract`}
      rows={[
        {
          id: 'server',
          label: 'Server Runtime',
          value: runtime.server,
          meta: 'Runtime tetap ke backend server existing, bukan backend lokal.',
          tone: 'success',
        },
        {
          id: 'client',
          label: 'Native Client',
          value: appConfig.nativeClientId,
          meta: `${appConfig.nativeOrigin} / ${appConfig.nativeUserAgent} / x-source: ${runtime.sourceHeader}`,
          tone: 'success',
        },
        {
          id: 'source',
          label: 'Source Contract',
          value: sourceRepo,
          meta: 'Route native dipetakan dari source live/snapshot yang menjadi acuan.',
          tone: 'success',
        },
        {
          id: 'evidence',
          label: 'Coverage Evidence',
          value: evidence,
          meta: 'Verifier menjaga route tetap sinkron dengan Kolam/POS/AM/plugin source.',
          tone: 'success',
        },
        {
          id: 'snapshot',
          label: 'Runtime Snapshot',
          value: `${dataset.catalog.length} item / ${dataset.recentSales.length} sales / ${dataset.customers.length} customer`,
          meta: `Sync ${runtime.label}: ${getSyncState(area, dataset)}.`,
          tone: getSyncState(area, dataset) === 'live' ? 'success' : 'warning',
        },
      ]}
    />
  );
}

function getRuntimeContract(area: AppArea) {
  if (area === 'am') {
    return {
      label: 'AM',
      server: appConfig.amApiBaseUrl,
      sourceHeader: appConfig.amSourceHeader,
    };
  }

  if (area === 'pos') {
    return {
      label: 'POS',
      server: appConfig.apiBaseUrl,
      sourceHeader: appConfig.sourceHeader,
    };
  }

  return {
    label: area === 'plugins' ? 'Plugin Host' : 'Kolam',
    server: appConfig.kolamApiBaseUrl,
    sourceHeader: appConfig.kolamSourceHeader,
  };
}

function getSyncState(area: AppArea, dataset: UnifiedDataset) {
  if (area === 'am') {
    return dataset.sync.am;
  }

  if (area === 'pos') {
    return dataset.sync.pos;
  }

  return dataset.sync.kolam;
}
