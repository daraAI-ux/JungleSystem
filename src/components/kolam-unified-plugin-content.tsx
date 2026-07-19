import React from 'react';
import {KolamPluginRegistryList} from './kolam-plugin-registry-widgets';
import type {KolamUnifiedModulePanelProps} from './kolam-unified-overview-panel-types';
import {KolamUnifiedModuleSourcePanel} from './kolam-unified-module-source-panel';

export function KolamUnifiedPluginContent({
  context,
  pluginSearch,
  onPluginSearchChange,
  onPluginRouteSelect,
}: KolamUnifiedModulePanelProps) {
  return (
    <>
      <KolamPluginRegistryList
        plugins={context.plugins}
        routeIndex={context.pluginRouteIndex}
        search={pluginSearch}
        onSearchChange={onPluginSearchChange}
        onRouteSelect={onPluginRouteSelect}
      />
      <KolamUnifiedModuleSourcePanel context={context} />
    </>
  );
}
