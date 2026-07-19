import React from 'react';
import type {RuntimeIdentityItem} from '../domain/runtime-identity';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamRuntimeIdentityCard} from './kolam-runtime-identity-card';

export function KolamRuntimeIdentityGrid({
  items,
}: {
  items: RuntimeIdentityItem[];
}) {
  return (
    <KolamListFrame variant="runtimeIdentityGrid">
      <KolamMappedList
        items={items}
        getKey={item => item.id}
        renderItem={item => <KolamRuntimeIdentityCard item={item} />}
      />
    </KolamListFrame>
  );
}
