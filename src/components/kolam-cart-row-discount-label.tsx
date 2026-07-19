import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {cartRowStyles as styles} from './kolam-cart-row-styles';

export function KolamCartRowDiscountLabel() {
  return (
    <KolamCopyStack
      items={[
        {id: 'label', text: 'Diskon item', style: styles.lineDiscountLabel},
      ]}
    />
  );
}
