import React from 'react';
import {appConfig} from '../config/app';
import {
  getKolamNavigationRouteSurfaceContract,
  type KolamNavigationItem,
} from '../domain/kolam-navigation';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamModulePanel} from './kolam-module-panel';
import {KolamRouteWorkbench} from './kolam-route-workbench';

export function KolamNavigationRouteSurface({
  dataset,
  item,
}: {
  dataset: UnifiedDataset;
  item: KolamNavigationItem;
}) {
  const contract = getKolamNavigationRouteSurfaceContract(item);

  return (
    <KolamModulePanel
      title={item.label}
      hint={`${contract.runtimeRoute} dibuka sebagai native route surface sementara.`}>
      <KolamDescriptionList
        accessibilityLabel={`${item.label} route details`}
        rows={[
          {
            id: 'route',
            label: 'Route',
            value: contract.runtimeRoute,
            meta: item.description,
            tone: 'default',
          },
          {
            id: 'pattern',
            label: 'Route Pattern',
            value: contract.routePattern,
            meta: `${contract.routeKind} dari coverage FE live.`,
            tone: 'success',
          },
          {
            id: 'base-route',
            label: 'Base Route',
            value: contract.baseRoute,
            meta: 'Dipakai untuk mengikat route detail/create/edit ke modul native yang sama.',
            tone: 'default',
          },
          {
            id: 'group',
            label: 'Kelompok',
            value: item.group ?? 'Kolam',
            meta: 'Diambil dari menu Kolam live, bukan backend lokal.',
            tone: 'default',
          },
          {
            id: 'access',
            label: 'Akses',
            value: item.requiredAccess.join(', '),
            meta: 'Route tetap mengikuti pembatasan akses native shell.',
            tone: 'success',
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
            label: 'Source',
            value: contract.sourceRepo,
            meta: contract.sourcePath,
            tone: 'success',
          },
          {
            id: 'coverage',
            label: 'Coverage',
            value: contract.coverageEvidence,
            meta: 'Verifier memastikan semua page.tsx FE live punya route native.',
            tone: 'success',
          },
          {
            id: 'snapshot',
            label: 'Runtime',
            value: `${dataset.catalog.length} item / ${dataset.recentSales.length} sales / ${dataset.customers.length} customer`,
            meta: 'Data runtime tetap dibaca dari server/snapshot unified yang sama.',
            tone: 'default',
          },
        ]}
      />
      <KolamRouteWorkbench
        area="kolam"
        dataset={dataset}
        description={item.description}
        label={item.label}
        route={contract.runtimeRoute}
        sourceRepo={contract.sourceRepo}
      />
    </KolamModulePanel>
  );
}
