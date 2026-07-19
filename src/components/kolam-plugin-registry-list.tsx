import React from 'react';
import type {PluginDescriptor, PluginRouteEntry} from '../domain/unified';
import {KolamListFrame} from './kolam-list-frame';
import {KolamPluginRegistryEmptyState} from './kolam-plugin-registry-empty-state';
import {KolamPluginRegistryRouteLauncher} from './kolam-plugin-registry-route-launcher';
import {KolamPluginRegistrySearch} from './kolam-plugin-registry-search';
import {KolamPluginRegistrySummary} from './kolam-plugin-registry-summary';
import {KolamPluginRegistryTable} from './kolam-plugin-registry-table';

export function KolamPluginRegistryList({
  plugins,
  routeIndex,
  search,
  onSearchChange,
  onRouteSelect,
}: {
  plugins: PluginDescriptor[];
  routeIndex: PluginRouteEntry[];
  search: string;
  onSearchChange?: (query: string) => void;
  onRouteSelect?: (route: PluginRouteEntry) => void;
}) {
  return (
    <KolamListFrame variant="pluginList">
      <KolamPluginRegistrySearch
        search={search}
        onSearchChange={onSearchChange}
      />
      <KolamPluginRegistrySummary plugins={plugins} routeIndex={routeIndex} />
      <KolamPluginRegistryRouteLauncher
        routeIndex={routeIndex}
        onRouteSelect={onRouteSelect}
      />
      {plugins.length ? (
        <KolamPluginRegistryTable plugins={plugins} />
      ) : (
        <KolamPluginRegistryEmptyState />
      )}
    </KolamListFrame>
  );
}
