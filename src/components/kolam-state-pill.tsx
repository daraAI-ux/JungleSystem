import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamPillFrame} from './kolam-pill-frame';
import {statePillGroupStyles as styles} from './kolam-state-pill-group-styles';
import type {KolamStatePillGroupItem} from './kolam-state-pill-group-types';

export function KolamStatePill({item}: {item: KolamStatePillGroupItem}) {
  return (
    <KolamPillFrame disabled={item.disabled} selected={item.selected}>
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: item.label,
            style: [
              styles.label,
              item.selected && styles.labelSelected,
              item.disabled && styles.labelDisabled,
            ],
          },
        ]}
      />
    </KolamPillFrame>
  );
}
