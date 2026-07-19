import React from 'react';
import type {PluginDescriptor} from '../domain/unified';
import {KolamPluginRegistryRowCapabilities} from './kolam-plugin-registry-row-capabilities';
import {KolamPluginRegistryRowIdentity} from './kolam-plugin-registry-row-identity';
import {KolamPluginRegistryRowStatus} from './kolam-plugin-registry-row-status';
import {KolamRowFrame} from './kolam-row-frame';

export function KolamPluginRegistryRow({plugin}: {plugin: PluginDescriptor}) {
  return (
    <KolamRowFrame variant="pluginRegistry">
      <KolamPluginRegistryRowIdentity plugin={plugin} />
      <KolamPluginRegistryRowCapabilities plugin={plugin} />
      <KolamPluginRegistryRowStatus plugin={plugin} />
    </KolamRowFrame>
  );
}