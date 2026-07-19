import React from 'react';
import {appConfig} from '../config/app';
import {kolamSurfaces, type UnifiedSurface} from '../domain/unified';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamModulePanel} from './kolam-module-panel';
import {KolamRouteContractPanel} from './kolam-route-contract-panel';
import {KolamRouteWorkbench} from './kolam-route-workbench';
import {KolamSurfaceContractList} from './kolam-unified-operational-widgets';

export function KolamSurfaceRouteSurface({
  dataset,
  surface,
}: {
  dataset: UnifiedDataset;
  surface: UnifiedSurface;
}) {
  return (
    <KolamModulePanel
      title={`Kolam - ${surface.label}`}
      hint={`${surface.route} dibuka sebagai native Kolam surface sementara.`}>
      <KolamDescriptionList
        accessibilityLabel={`${surface.label} Kolam surface details`}
        rows={[
          {
            id: 'route',
            label: 'Route',
            value: surface.route,
            meta: surface.description,
            tone: 'default',
          },
          {
            id: 'server',
            label: 'Server',
            value: appConfig.kolamApiBaseUrl,
            meta: 'Runtime Kolam tetap mengarah ke backend server existing, bukan backend lokal.',
            tone: 'success',
          },
          {
            id: 'source',
            label: 'Source Repo',
            value: surface.sourceRepo,
            meta: 'Surface diambil dari registry source FE Kolam live.',
            tone: 'success',
          },
          {
            id: 'runtime',
            label: 'Runtime',
            value: `${dataset.catalog.length} item / ${dataset.recentSales.length} sales / ${dataset.customers.length} customer`,
            meta: `Sync Kolam saat ini: ${dataset.sync.kolam}.`,
            tone: dataset.sync.kolam === 'live' ? 'success' : 'warning',
          },
        ]}
      />
      <KolamRouteWorkbench
        area="kolam"
        dataset={dataset}
        description={surface.description}
        label={surface.label}
        route={surface.route}
        sourceRepo={surface.sourceRepo}
      />
      <KolamRouteContractPanel
        area="kolam"
        dataset={dataset}
        evidence="npm run verify:live-routes"
        route={surface.route}
        sourceRepo={surface.sourceRepo}
      />
      <KolamSurfaceContractList surfaces={kolamSurfaces} />
    </KolamModulePanel>
  );
}
