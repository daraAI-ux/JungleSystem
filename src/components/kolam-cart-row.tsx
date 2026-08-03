import React from 'react';
import type {CartLine, CatalogItem} from '../domain/pos';
import {KolamCartRowActions} from './kolam-cart-row-actions';
import {KolamCartRowDiscountControls} from './kolam-cart-row-discount-controls';
import {KolamCartRowDiscountLabel} from './kolam-cart-row-discount-label';
import {KolamCartRowItemInfo} from './kolam-cart-row-item-info';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamListFrame} from './kolam-list-frame';
import {KolamRowFrame} from './kolam-row-frame';
import {cartRowStyles as styles} from './kolam-cart-row-styles';

export interface KolamCartRowProps {
  catalog: CatalogItem[];
  line: CartLine;
  onDiscountAmountChange: (itemId: string, value: string) => void;
  onDiscountTypeChange: (
    itemId: string,
    discountType: CartLine['discountType'],
  ) => void;
  onQuantityChange: (itemId: string, nextQuantity: number) => void;
  onVoucherCodeChange: (itemId: string, voucherCode: string) => void;
}

export function KolamCartRow({
  catalog,
  line,
  onDiscountAmountChange,
  onDiscountTypeChange,
  onQuantityChange,
  onVoucherCodeChange,
}: KolamCartRowProps) {
  const item = catalog.find(catalogItem => catalogItem.id === line.itemId);

  if (!item) {
    return null;
  }

  return (
    <KolamRowFrame variant="cart">
      <KolamCartRowItemInfo item={item} line={line} />
      <KolamCartRowActions
        item={item}
        line={line}
        onQuantityChange={onQuantityChange}
      />
      <KolamCartRowDiscountLabel />
      <KolamCartRowDiscountControls
        line={line}
        onDiscountAmountChange={onDiscountAmountChange}
        onDiscountTypeChange={onDiscountTypeChange}
      />
      <KolamListFrame variant="discountControlRow">
        <KolamFormTextField
          accessibilityLabel={`Kode voucher ${item.name}`}
          onChangeText={value => onVoucherCodeChange(line.itemId, value)}
          placeholder="Kode voucher"
          style={styles.lineDiscountInput}
          value={line.voucherCode ?? ''}
        />
      </KolamListFrame>
    </KolamRowFrame>
  );
}
