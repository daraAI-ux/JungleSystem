import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamFormTextField} from './kolam-form-text-field';
import {checkoutSummaryStyles as styles} from './kolam-checkout-summary-styles';

export function KolamCheckoutShippingField({
  shippingCost,
  onShippingCostChange,
}: {
  shippingCost: number;
  onShippingCostChange: (value: string) => void;
}) {
  return (
    <>
      <KolamCopyStack
        items={[{id: 'label', text: 'Shipping', style: styles.adjustmentLabel}]}
      />
      <KolamFormTextField
        value={String(shippingCost)}
        onChangeText={onShippingCostChange}
        mode="numeric"
        placeholder="0"
        style={styles.adjustmentInputFull}
      />
    </>
  );
}
