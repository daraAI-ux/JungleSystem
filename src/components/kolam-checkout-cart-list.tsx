import React from 'react';
import type {CartLine, CatalogItem} from '../domain/pos';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamCartRow} from './kolam-pos-widgets';

export function KolamCheckoutCartList({
  cart,
  catalog,
  onDiscountAmountChange,
  onDiscountTypeChange,
  onQuantityChange,
  onVoucherCodeChange,
}: {
  cart: CartLine[];
  catalog: CatalogItem[];
  onDiscountAmountChange: (itemId: string, value: string) => void;
  onDiscountTypeChange: (
    itemId: string,
    discountType: CartLine['discountType'],
  ) => void;
  onQuantityChange: (itemId: string, nextQuantity: number) => void;
  onVoucherCodeChange: (itemId: string, voucherCode: string) => void;
}) {
  return (
    <KolamContentFrame variant="checkoutCartList">
      {cart.length ? (
        <KolamMappedList
          items={cart}
          getKey={line => line.itemId}
          renderItem={line => (
            <KolamCartRow
              line={line}
              catalog={catalog}
              onQuantityChange={onQuantityChange}
              onDiscountTypeChange={onDiscountTypeChange}
              onDiscountAmountChange={onDiscountAmountChange}
              onVoucherCodeChange={onVoucherCodeChange}
            />
          )}
        />
      ) : (
        <KolamEmptyState
          title="Cart masih kosong"
          message="Pilih item dari katalog sellable untuk mulai checkout."
          compact
        />
      )}
    </KolamContentFrame>
  );
}