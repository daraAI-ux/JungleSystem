import React from 'react';
import type {PluginDescriptor} from '../domain/unified';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {pluginRegistryRowStyles as styles} from './kolam-plugin-registry-row-styles';

export function KolamPluginRegistryRowIdentity({
  plugin,
}: {
  plugin: PluginDescriptor;
}) {
  return (
    <KolamInlineFrame variant="pluginIdentity">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: plugin.manifestName,
            style: styles.pluginTitle,
          },
          {
            id: 'package',
            text: plugin.description,
            style: styles.pluginPackage,
          },
          {
            id: 'route',
            text: `${plugin.routes.slice(0, 3).join(' / ')}${
              plugin.routes.length > 3 ? ` / +${plugin.routes.length - 3}` : ''
            }`,
            style: styles.pluginRoute,
          },
        ]}
      />
    </KolamInlineFrame>
  );
}