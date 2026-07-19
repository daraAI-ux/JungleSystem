import React from 'react';
import type {UnifiedSurface} from '../domain/unified';
import {KolamCopyStack} from './kolam-copy-stack';
import {surfaceRowStyles as styles} from './kolam-surface-row-styles';

export function KolamSurfaceRowIdentity({
  surface,
}: {
  surface: UnifiedSurface;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.identity}
      items={[
        {id: 'label', text: surface.label, style: styles.title},
        {id: 'description', text: surface.description, style: styles.description},
      ]}
    />
  );
}
