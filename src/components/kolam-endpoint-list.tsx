import React from 'react';
import {KolamEndpointListRow} from './kolam-endpoint-list-row';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import type {KolamEndpointListProps} from './kolam-endpoint-list-types';

export type {
  KolamEndpointListItem,
  KolamEndpointListProps,
} from './kolam-endpoint-list-types';

export function KolamEndpointList({
  accessibilityLabel,
  endpoints,
}: KolamEndpointListProps) {
  return (
    <KolamListFrame variant="endpointList" accessibilityLabel={accessibilityLabel}>
      <KolamMappedList
        items={endpoints}
        getKey={endpoint => endpoint.id}
        renderItem={endpoint => <KolamEndpointListRow endpoint={endpoint} />}
      />
    </KolamListFrame>
  );
}