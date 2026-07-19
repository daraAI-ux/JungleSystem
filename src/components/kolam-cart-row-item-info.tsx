import React from 'react';
import type {CartLine, CatalogItem} from '../domain/pos';
import {formatRupiah} from '../lib/money';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {cartRowStyles as styles} from './kolam-cart-row-styles';

export function KolamCartRowItemInfo({
  item,
  line,
}: {
  item: CatalogItem;
  line: CartLine;
}) {
  return (
    <KolamInlineFrame variant="cartItemInfo">
      <KolamCopyStack
        items={[
          {id: 'name', text: item.name, style: styles.cartItemName},
          {
            id: 'meta',
            text: `${line.quantity} x ${formatRupiah(item.price)}`,
            style: styles.cartItemMeta,
          },
        ]}
      />
    </KolamInlineFrame>
  );
}