import React from 'react';
import {KolamUnifiedSourcePanel} from './kolam-unified-source-widgets';
import type {KolamUnifiedOverviewContext} from './kolam-unified-overview-panel-types';

export function KolamUnifiedModuleSourcePanel({
  context,
}: {
  context: KolamUnifiedOverviewContext;
}) {
  return (
    <KolamUnifiedSourcePanel
      dataset={context.dataset}
      module={context.module}
      pluginCount={context.plugins.length}
      totalPluginCount={context.totalPluginCount}
    />
  );
}
