import React from 'react';
import {getPluginSurfaceRowVisualContract} from '../domain/plugin-surface';
import type {PluginDescriptor} from '../domain/unified';
import {KolamArrowIcon} from './kolam-arrow-icon';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {pluginRegistryRowStyles as styles} from './kolam-plugin-registry-row-styles';

const PLUGIN_SURFACE_ROW_VISUAL = getPluginSurfaceRowVisualContract();

export function KolamPluginRegistryRowRepoRoute({
  plugin,
}: {
  plugin: PluginDescriptor;
}) {
  return (
    <KolamInlineFrame variant="pluginRepoRoute">
      <KolamCopyStack
        items={[
          {
            id: 'package',
            text: plugin.packageName,
            style: styles.pluginRepoText,
          },
        ]}
      />
      {PLUGIN_SURFACE_ROW_VISUAL.packageEntrySeparatorIconKind ===
      'arrow-right' ? (
        <KolamArrowIcon />
      ) : null}
      <KolamCopyStack
        items={[
          {
            id: 'entry',
            text: plugin.entryPoint,
            style: styles.pluginRepoText,
          },
        ]}
      />
    </KolamInlineFrame>
  );
}