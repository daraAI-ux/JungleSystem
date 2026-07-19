import React from 'react';
import {KolamEndpointListContract} from './kolam-endpoint-list-contract';
import {KolamEndpointListCopy} from './kolam-endpoint-list-copy';
import type {KolamEndpointListItem} from './kolam-endpoint-list-types';
import {KolamRowFrame} from './kolam-row-frame';

export function KolamEndpointListRow({
  endpoint,
}: {
  endpoint: KolamEndpointListItem;
}) {
  return (
    <KolamRowFrame variant="endpoint">
      <KolamEndpointListCopy endpoint={endpoint} />
      <KolamEndpointListContract endpoint={endpoint} />
    </KolamRowFrame>
  );
}
