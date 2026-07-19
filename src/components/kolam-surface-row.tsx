import React from 'react';
import {KolamRowFrame} from './kolam-row-frame';
import {KolamSurfaceRowIdentity} from './kolam-surface-row-identity';
import {KolamSurfaceRowMeta} from './kolam-surface-row-meta';
import type {KolamSurfaceRowProps} from './kolam-surface-row-types';

export type {KolamSurfaceRowProps} from './kolam-surface-row-types';

export function KolamSurfaceRow({surface}: KolamSurfaceRowProps) {
  return (
    <KolamRowFrame variant="surface">
      <KolamSurfaceRowIdentity surface={surface} />
      <KolamSurfaceRowMeta surface={surface} />
    </KolamRowFrame>
  );
}
