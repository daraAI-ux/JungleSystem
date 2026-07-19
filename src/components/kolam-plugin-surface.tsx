import React from 'react';
import {getShellModule} from '../domain/app-shell';
import type {PluginRouteEntry} from '../domain/unified';
import type {UnifiedDataset} from '../services/unified-data';
import {KolamDescriptionList} from './kolam-description-list';
import {KolamModulePanel} from './kolam-module-panel';
import {KolamRouteContractPanel} from './kolam-route-contract-panel';
import {KolamRouteWorkbench} from './kolam-route-workbench';
import type {KolamPluginSurfaceProps} from './kolam-workspace-module-surface-types';
import {KolamUnifiedOverviewPanel} from './kolam-unified-overview-widgets';

export function KolamPluginSurface({
  activePluginRoute,
  dataset,
  onPluginRouteSelect,
  plugins,
}: {
  activePluginRoute?: PluginRouteEntry | null;
  dataset: UnifiedDataset;
  onPluginRouteSelect?: (route: PluginRouteEntry) => void;
  plugins: KolamPluginSurfaceProps;
}) {
  return (
    <>
      {activePluginRoute ? (
        <KolamModulePanel
          title={`${activePluginRoute.pluginLabel} Route`}
          hint={`${activePluginRoute.route} dibuka sebagai native plugin route surface sementara.`}>
          <KolamDescriptionList
            accessibilityLabel={`${activePluginRoute.pluginLabel} plugin route details`}
            rows={[
              {
                id: 'route',
                label: 'Route',
                value: activePluginRoute.route,
                meta: activePluginRoute.manifestName,
                tone: 'default',
              },
              {
                id: 'plugin',
                label: 'Plugin',
                value: activePluginRoute.pluginLabel,
                meta: activePluginRoute.sourceRepo,
                tone: 'default',
              },
              {
                id: 'status',
                label: 'Status',
                value: activePluginRoute.integrationStatus,
                meta: 'Route berasal dari manifest plugin live dan registry native.',
                tone:
                  activePluginRoute.integrationStatus === 'ready'
                    ? 'success'
                    : 'warning',
              },
              {
                id: 'runtime',
                label: 'Runtime',
                value: `${plugins.filteredPlugins.length} plugin / ${dataset.sync.kolam} Kolam`,
                meta: 'Plugin route tetap berjalan melalui host Windows native, bukan WebView shell.',
                tone: 'default',
              },
            ]}
          />
          <KolamRouteWorkbench
            area="plugins"
            dataset={dataset}
            description={activePluginRoute.manifestName}
            label={activePluginRoute.pluginLabel}
            route={activePluginRoute.route}
            sourceRepo={activePluginRoute.sourceRepo}
          />
          <KolamRouteContractPanel
            area="plugins"
            dataset={dataset}
            evidence="npm run verify:registry"
            route={activePluginRoute.route}
            sourceRepo={activePluginRoute.sourceRepo}
          />
        </KolamModulePanel>
      ) : null}
      <KolamUnifiedOverviewPanel
        module={getShellModule('plugins')}
        dataset={dataset}
        plugins={plugins.filteredPlugins}
        pluginSearch={plugins.pluginSearch}
        onPluginSearchChange={plugins.onPluginSearchChange}
        onPluginRouteSelect={onPluginRouteSelect}
      />
    </>
  );
}
