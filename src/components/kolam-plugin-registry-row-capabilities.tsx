import React from 'react';
import type {PluginDescriptor} from '../domain/unified';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamPluginRegistryRowRepoRoute} from './kolam-plugin-registry-row-repo-route';
import {pluginRegistryRowStyles as styles} from './kolam-plugin-registry-row-styles';

export function KolamPluginRegistryRowCapabilities({
  plugin,
}: {
  plugin: PluginDescriptor;
}) {
  return (
    <KolamInlineFrame variant="pluginCapabilities">
      <KolamCopyStack
        items={[
          {
            id: 'capabilities',
            text: plugin.capabilities.join(' / '),
            style: styles.pluginCapabilityText,
          },
          {id: 'repo', text: plugin.sourceRepo, style: styles.pluginRepo},
        ]}
      />
      <KolamPluginRegistryRowRepoRoute plugin={plugin} />
    </KolamInlineFrame>
  );
}