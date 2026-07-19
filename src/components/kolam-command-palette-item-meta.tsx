import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {commandPaletteItemStyles as styles} from './kolam-command-palette-item-styles';

export function KolamCommandPaletteItemMeta({
  meta,
  showMeta,
}: {
  meta?: string;
  showMeta: boolean;
}) {
  return showMeta && meta ? (
    <KolamCopyStack
      items={[
        {
          id: 'meta',
          text: meta,
          style: styles.meta,
          textProps: {numberOfLines: 1},
        },
      ]}
    />
  ) : null;
}
