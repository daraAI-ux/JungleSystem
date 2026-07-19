import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {getPluginRoutePreviewLabel} from '../domain/plugin-surface';
import type {PluginRouteEntry} from '../domain/unified';
import {pluginRegistryListStyles as styles} from './kolam-plugin-registry-list-styles';

export function KolamPluginRegistryRoutePreview({
  routeIndex,
}: {
  routeIndex: PluginRouteEntry[];
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'preview',
          text: getPluginRoutePreviewLabel(routeIndex),
          style: styles.pluginHubSummaryMuted,
        },
      ]}
    />
  );
}
