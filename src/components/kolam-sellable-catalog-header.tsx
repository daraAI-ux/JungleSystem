import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {sellableCatalogPickerStyles as styles} from './kolam-sellable-catalog-picker-styles';

export function KolamSellableCatalogHeader() {
  return (
    <KolamHeaderFrame variant="sectionHeader">
      <KolamCopyStack
        items={[
          {id: 'title', text: 'Katalog Sellable', style: styles.sectionTitle},
          {
            id: 'hint',
            text: 'Product dan species mengikuti flow POS lama.',
            style: styles.sectionHint,
          },
        ]}
      />
    </KolamHeaderFrame>
  );
}