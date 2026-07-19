import React from 'react';
import type {CheckoutState} from '../domain/pos';
import {KolamChoiceSegment} from './kolam-choice-segment';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamListFrame} from './kolam-list-frame';
import {checkoutSummaryStyles as styles} from './kolam-checkout-summary-styles';

export function KolamCheckoutDiscountRow({
  checkout,
  onGlobalDiscountChange,
  onGlobalDiscountTypeChange,
}: {
  checkout: CheckoutState;
  onGlobalDiscountChange: (value: string) => void;
  onGlobalDiscountTypeChange: (
    discountType: CheckoutState['globalDiscountType'],
  ) => void;
}) {
  return (
    <>
      <KolamCopyStack
        items={[
          {id: 'label', text: 'Diskon global', style: styles.adjustmentLabel},
        ]}
      />
      <KolamListFrame variant="discountControlRow" style={styles.adjustmentRow}>
        <KolamChoiceSegment
          id="fixed"
          label="Rp"
          selectedId={checkout.globalDiscountType}
          onSelect={onGlobalDiscountTypeChange}
        />
        <KolamChoiceSegment
          id="percentage"
          label="%"
          selectedId={checkout.globalDiscountType}
          onSelect={onGlobalDiscountTypeChange}
        />
        <KolamFormTextField
          value={String(checkout.globalDiscount)}
          onChangeText={onGlobalDiscountChange}
          mode="numeric"
          placeholder="0"
          style={styles.adjustmentInput}
        />
      </KolamListFrame>
    </>
  );
}