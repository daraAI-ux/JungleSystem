import React from 'react';
import type {PluginRouteEntry} from '../domain/unified';
import {getPluginIntegrationStats, type PluginDescriptor} from '../domain/unified';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamPluginRegistryRoutePreview} from './kolam-plugin-registry-route-preview';
import {KolamPluginRegistrySummaryGrid} from './kolam-plugin-registry-summary-grid';

export function KolamPluginRegistrySummary({
  plugins,
  routeIndex,
}: {
  plugins: PluginDescriptor[];
  routeIndex: PluginRouteEntry[];
}) {
  const stats = getPluginIntegrationStats(plugins);

  return (
    <KolamCardFrame variant="pluginSummary">
      <KolamPluginRegistrySummaryGrid stats={stats} />
      <KolamPluginRegistryRoutePreview routeIndex={routeIndex} />
    </KolamCardFrame>
  );
}