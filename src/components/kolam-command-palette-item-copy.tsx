import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {commandPaletteItemStyles as styles} from './kolam-command-palette-item-styles';

export function KolamCommandPaletteItemCopy({
  description,
  label,
  showDescription,
}: {
  description?: string;
  label: string;
  showDescription: boolean;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.copy}
      items={[
        {id: 'label', text: label, style: styles.label},
        ...(showDescription && description
          ? [
              {
                id: 'description',
                text: description,
                style: styles.description,
                textProps: {numberOfLines: 1},
              },
            ]
          : []),
      ]}
    />
  );
}
