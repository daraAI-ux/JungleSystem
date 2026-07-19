import React from 'react';
import type {ShellModuleRouteEntry} from '../domain/app-shell';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamModulePanel} from './kolam-module-panel';
import {KolamRouteContractPanel} from './kolam-route-contract-panel';
import {KolamRouteWorkbench} from './kolam-route-workbench';

export function KolamModuleRouteSurface({
  dataset,
  route,
}: {
  dataset: UnifiedDataset;
  route: ShellModuleRouteEntry;
}) {
  return (
    <KolamModulePanel
      title={`${route.moduleLabel} Route`}
      hint={`${route.route} dibuka sebagai native module route surface sementara.`}>
      <KolamDescriptionList
        accessibilityLabel={`${route.moduleLabel} module route details`}
        rows={[
          {
            id: 'route',
            label: 'Route',
            value: route.route,
            meta: route.description,
            tone: 'default',
          },
          {
            id: 'module',
            label: 'Module',
            value: route.moduleLabel,
            meta: `${route.area.toUpperCase()} native workspace.`,
            tone: 'default',
          },
          {
            id: 'source',
            label: 'Source Repo',
            value: route.sourceRepo,
            meta: 'Route source diambil dari registry modul native, bukan backend lokal.',
            tone: 'success',
          },
          {
            id: 'runtime',
            label: 'Runtime',
            value: `${dataset.catalog.length} item / ${dataset.recentSales.length} sales / ${dataset.customers.length} customer`,
            meta: 'Data runtime tetap memakai server/snapshot unified yang sama.',
            tone: 'default',
          },
        ]}
      />
      <KolamRouteWorkbench
        area={route.area}
        dataset={dataset}
        description={route.description}
        label={route.moduleLabel}
        route={route.route}
        sourceRepo={route.sourceRepo}
      />
      <KolamRouteContractPanel
        area={route.area}
        dataset={dataset}
        evidence="npm run verify:shell-routes"
        route={route.route}
        sourceRepo={route.sourceRepo}
      />
    </KolamModulePanel>
  );
}
