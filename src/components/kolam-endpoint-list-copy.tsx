import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {KolamEndpointListItem} from './kolam-endpoint-list-types';
import {endpointListStyles as styles} from './kolam-endpoint-list-styles';

export function KolamEndpointListCopy({
  endpoint,
}: {
  endpoint: KolamEndpointListItem;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.copy}
      items={[
        {id: 'label', text: endpoint.label, style: styles.label},
        {id: 'permission', text: endpoint.permission, style: styles.meta},
      ]}
    />
  );
}
