import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {pluginRegistryListStyles as styles} from './kolam-plugin-registry-list-styles';

export function KolamPluginRegistryTableHeader() {
  return (
    <KolamCopyStack
      containerStyle={styles.tableHeaderRow}
      items={[
        {id: 'plugin', text: 'Plugin', style: styles.tableHeaderPrimary},
        {
          id: 'capability',
          text: 'Capability / Source',
          style: styles.tableHeaderMeta,
        },
        {id: 'status', text: 'Status', style: styles.tableHeaderStatus},
      ]}
    />
  );
}
