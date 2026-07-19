import React from 'react';
import {appConfig} from '../config/app';
import {amSurfaces, type UnifiedSurface} from '../domain/unified';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamModulePanel} from './kolam-module-panel';
import {KolamRouteContractPanel} from './kolam-route-contract-panel';
import {KolamRouteWorkbench} from './kolam-route-workbench';
import {KolamSurfaceLauncher} from './kolam-surface-launcher';
import {
  KolamAmOperationalPanel,
  KolamSurfaceContractList,
} from './kolam-unified-operational-widgets';
import {getAmStatusText} from './kolam-unified-status-text';

export function KolamAmSurface({
  activeSurface,
  dataset,
  onSurfaceSelect,
}: {
  activeSurface?: UnifiedSurface | null;
  dataset: UnifiedDataset;
  onSurfaceSelect?: (surface: UnifiedSurface) => void;
}) {
  const dashboard = dataset.am.dashboard;
  const title = activeSurface
    ? `Automation Management - ${activeSurface.label}`
    : 'Automation Management';
  const hint = activeSurface
    ? `${activeSurface.route} dibuka sebagai native AM route surface sementara.`
    : 'AM dibuka sebagai native Windows surface dengan runtime ke server existing.';

  return (
    <KolamModulePanel title={title} hint={hint}>
      <KolamDescriptionList
        accessibilityLabel="Automation Management runtime details"
        rows={[
          ...(activeSurface
            ? [
                {
                  id: 'active-route',
                  label: 'Route',
                  value: activeSurface.route,
                  meta: activeSurface.description,
                  tone: 'default' as const,
                },
                {
                  id: 'active-source',
                  label: 'Source Repo',
                  value: activeSurface.sourceRepo,
                  meta: 'Surface AM diambil dari registry source server, bukan backend lokal.',
                  tone: 'success' as const,
                },
              ]
            : []),
          {
            id: 'source',
            label: 'Source',
            value: dataset.am.source,
            meta: getAmStatusText(dataset),
            tone: dataset.am.source === 'live' ? 'success' : 'warning',
          },
          {
            id: 'server',
            label: 'Server',
            value: dataset.am.baseUrl ?? appConfig.amApiBaseUrl,
            meta: 'Runtime AM tetap mengarah ke backend server, bukan backend lokal.',
            tone: 'success',
          },
          {
            id: 'dashboard',
            label: 'Dashboard',
            value: dashboard
              ? `${dashboard.summary.totalAccounts} account / ${dashboard.summary.activeDevices} device aktif`
              : 'Menunggu data live',
            meta: 'Kontrak dibaca dari /dashboard AM existing.',
            tone: dashboard ? 'success' : 'warning',
          },
          {
            id: 'surfaces',
            label: 'Surface',
            value: `${amSurfaces.length} area`,
            meta: 'Dashboard, tasks, hardware, marketplace, dan operations.',
            tone: 'default',
          },
        ]}
      />
      {activeSurface ? (
        <>
          <KolamRouteWorkbench
            area="am"
            dataset={dataset}
            description={activeSurface.description}
            label={activeSurface.label}
            route={activeSurface.route}
            sourceRepo={activeSurface.sourceRepo}
          />
          <KolamRouteContractPanel
            area="am"
            dataset={dataset}
            evidence="npm run verify:shell-routes"
            route={activeSurface.route}
            sourceRepo={activeSurface.sourceRepo}
          />
        </>
      ) : null}
      <KolamSurfaceLauncher
        label="AM Surface Launcher"
        surfaces={amSurfaces}
        onSurfaceSelect={onSurfaceSelect}
      />
      <KolamAmOperationalPanel dataset={dataset} />
      <KolamSurfaceContractList surfaces={amSurfaces} />
    </KolamModulePanel>
  );
}
