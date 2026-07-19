import React from 'react';
import { getShellModule } from '../domain/app-shell';
import { pluginRegistry } from '../domain/unified';
import { useKolamOverviewController } from '../hooks/use-kolam-overview-controller';
import { KolamAppLaunchSurface } from './kolam-app-launch-surface';
import {
  KolamRuntimeSurface,
  type KolamRuntimeSurfaceProps,
} from './kolam-runtime-surface';
import { type KolamUnifiedOverviewPanelProps } from './kolam-unified-overview-panel-types';
import { KolamUnifiedModulePanel } from './kolam-unified-module-panel';
import { KolamUnifiedRuntimeFooter } from './kolam-unified-source-widgets';

export function KolamPreparationSurface({
  dataset,
  plugins = pluginRegistry,
  pluginSearch = '',
  onCommandSelect,
  onPluginSearchChange,
  onPluginRouteSelect,
  onSelectModule,
  onSurfaceSelect,
  runtime,
  salesGraphRange,
}: Omit<KolamUnifiedOverviewPanelProps, 'module'> & {
  runtime?: KolamRuntimeSurfaceProps;
}) {
  const { context, surfaces } = useKolamOverviewController({
    dataset,
    module: getShellModule('kolam'),
    plugins,
    salesGraphRange,
  });

  return (
    <>
      <KolamAppLaunchSurface
        onCommandSelect={onCommandSelect}
        onSelectModule={onSelectModule}
      />
      <KolamUnifiedModulePanel
        context={context}
        pluginSearch={pluginSearch}
        onPluginSearchChange={onPluginSearchChange}
        onPluginRouteSelect={onPluginRouteSelect}
        onSurfaceSelect={onSurfaceSelect}
        surfaces={surfaces}
      />
      <KolamUnifiedRuntimeFooter />
      {runtime ? <KolamRuntimeSurface {...runtime} /> : null}
    </>
  );
}
