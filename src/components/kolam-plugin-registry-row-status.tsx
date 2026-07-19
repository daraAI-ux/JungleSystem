import React from 'react';
import type {PluginDescriptor} from '../domain/unified';
import {KolamBadge} from './kolam-badge';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {pluginRegistryRowStyles as styles} from './kolam-plugin-registry-row-styles';

export function KolamPluginRegistryRowStatus({
  plugin,
}: {
  plugin: PluginDescriptor;
}) {
  return (
    <KolamInlineFrame variant="pluginStatusBox">
      <KolamBadge
        label={plugin.integrationStatus === 'ready' ? 'Ready' : 'Mismatch'}
        intent={plugin.integrationStatus === 'ready' ? 'success' : 'warning'}
      />
      <KolamCopyStack
        items={[
          {
            id: 'package',
            text: `pkg v${plugin.packageVersion}`,
            style: styles.pluginVersion,
          },
          {
            id: 'manifest',
            text: `manifest v${plugin.manifestVersion}`,
            style: styles.pluginManifestVersion,
          },
          {
            id: 'sdk',
            text: `SDK ${plugin.hostSdkVersion} / host ${plugin.hostMinVersion}`,
            style: styles.pluginManifestVersion,
          },
        ]}
      />
    </KolamInlineFrame>
  );
}