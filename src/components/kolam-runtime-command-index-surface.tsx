import React from 'react';
import {KolamCommandIndexPanel} from './kolam-status-runtime-widgets';
import type {KolamCommandIndexSurfaceProps} from './kolam-runtime-panel-surface-types';

export function KolamRuntimeCommandIndexSurface({
  commandIndex,
}: {
  commandIndex: KolamCommandIndexSurfaceProps;
}) {
  return <KolamCommandIndexPanel {...commandIndex} />;
}
