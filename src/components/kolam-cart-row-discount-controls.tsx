import React from 'react';
import type {CartLine} from '../domain/pos';
import {KolamChoiceSegment} from './kolam-choice-segment';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamListFrame} from './kolam-list-frame';
import {cartRowStyles as styles} from './kolam-cart-row-styles';

export function KolamCartRowDiscountControls({
  line,
  onDiscountAmountChange,
  onDiscountTypeChange,
}: {
  line: CartLine;
  onDiscountAmountChange: (itemId: string, value: string) => void;
  onDiscountTypeChange: (
    itemId: string,
    discountType: CartLine['discountType'],
  ) => void;
}) {
  return (
    <KolamListFrame variant="discountControlRow">
      <KolamChoiceSegment
        id="fixed"
        label="Rp"
        selectedId={line.discountType}
        onSelect={discountType => onDiscountTypeChange(line.itemId, discountType)}
      />
      <KolamChoiceSegment
        id="percentage"
        label="%"
        selectedId={line.discountType}
        onSelect={discountType => onDiscountTypeChange(line.itemId, discountType)}
      />
      <KolamFormTextField
        value={String(line.discountAmount)}
        onChangeText={value => onDiscountAmountChange(line.itemId, value)}
        mode="numeric"
        placeholder="0"
        style={styles.lineDiscountInput}
      />
    </KolamListFrame>
  );
}