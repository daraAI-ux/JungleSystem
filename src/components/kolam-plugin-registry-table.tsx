import React from 'react';
import type {PluginDescriptor} from '../domain/unified';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamPluginRegistryRow} from './kolam-plugin-registry-row';
import {KolamPluginRegistryTableHeader} from './kolam-plugin-registry-table-header';

export function KolamPluginRegistryTable({
  plugins,
}: {
  plugins: PluginDescriptor[];
}) {
  return (
    <KolamCardFrame variant="pluginTable">
      <KolamPluginRegistryTableHeader />
      <KolamMappedList
        items={plugins}
        getKey={plugin => plugin.id}
        renderItem={plugin => <KolamPluginRegistryRow plugin={plugin} />}
      />
    </KolamCardFrame>
  );
}