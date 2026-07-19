import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {quantityStepperStyles as styles} from './kolam-quantity-stepper-styles';

export function KolamQuantityStepperValue({quantity}: {quantity: number}) {
  return (
    <KolamCopyStack
      items={[{id: 'quantity', text: quantity, style: styles.quantity}]}
    />
  );
}
