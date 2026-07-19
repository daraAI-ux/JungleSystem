import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {KolamEndpointListItem} from './kolam-endpoint-list-types';
import {endpointListStyles as styles} from './kolam-endpoint-list-styles';

export function KolamEndpointListContract({
  endpoint,
}: {
  endpoint: KolamEndpointListItem;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.contract}
      items={[
        {id: 'method', text: endpoint.method, style: styles.method},
        {id: 'path', text: endpoint.path, style: styles.path},
      ]}
    />
  );
}
