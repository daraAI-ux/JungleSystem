import React from 'react';
import type {CartLine, CatalogItem} from '../domain/pos';
import {getCartLineSubtotal} from '../lib/checkout';
import {formatRupiah} from '../lib/money';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamListFrame} from './kolam-list-frame';
import {KolamQuantityStepper} from './kolam-quantity-stepper';
import {cartRowStyles as styles} from './kolam-cart-row-styles';

export function KolamCartRowActions({
  item,
  line,
  onQuantityChange,
}: {
  item: CatalogItem;
  line: CartLine;
  onQuantityChange: (itemId: string, nextQuantity: number) => void;
}) {
  return (
    <KolamListFrame variant="cartActionRow">
      <KolamQuantityStepper
        quantity={line.quantity}
        onDecrement={() => onQuantityChange(line.itemId, line.quantity - 1)}
        onIncrement={() => onQuantityChange(line.itemId, line.quantity + 1)}
      />
      <KolamCopyStack
        items={[
          {
            id: 'subtotal',
            text: formatRupiah(getCartLineSubtotal(line, item)),
            style: styles.cartSubtotal,
          },
        ]}
      />
    </KolamListFrame>
  );
}