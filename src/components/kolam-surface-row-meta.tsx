import React from 'react';
import type {UnifiedSurface} from '../domain/unified';
import {KolamCopyStack} from './kolam-copy-stack';
import {surfaceRowStyles as styles} from './kolam-surface-row-styles';

export function KolamSurfaceRowMeta({surface}: {surface: UnifiedSurface}) {
  return (
    <KolamCopyStack
      containerStyle={styles.metaBox}
      items={[
        {id: 'route', text: surface.route, style: styles.route},
        {id: 'repo', text: surface.sourceRepo, style: styles.repo},
      ]}
    />
  );
}
