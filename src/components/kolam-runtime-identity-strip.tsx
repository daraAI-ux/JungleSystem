import React from 'react';
import type {RuntimeIdentityItem} from '../domain/runtime-identity';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamRuntimeIdentityGrid} from './kolam-runtime-identity-grid';
import {KolamRuntimeIdentityHeader} from './kolam-runtime-identity-header';

export function KolamRuntimeIdentityStrip({
  items,
  meta,
}: {
  items: RuntimeIdentityItem[];
  meta: string;
}) {
  return (
    <KolamCardFrame variant="runtimeIdentityStrip">
      <KolamRuntimeIdentityHeader meta={meta} />
      <KolamRuntimeIdentityGrid items={items} />
    </KolamCardFrame>
  );
}