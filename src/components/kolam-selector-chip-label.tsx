import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {selectorChipStyles as styles} from './kolam-selector-chip-styles';

export function KolamSelectorChipLabel({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <KolamCopyStack
      items={[
        {id: 'label', text: label, style: [styles.text, active && styles.textActive]},
      ]}
    />
  );
}
