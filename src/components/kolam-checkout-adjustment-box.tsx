import React from 'react';
import type {CheckoutState} from '../domain/pos';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCheckoutDiscountRow} from './kolam-checkout-discount-row';
import {KolamCheckoutShippingField} from './kolam-checkout-shipping-field';

export function KolamCheckoutAdjustmentBox({
  checkout,
  onGlobalDiscountChange,
  onGlobalDiscountTypeChange,
  onShippingCostChange,
}: {
  checkout: CheckoutState;
  onGlobalDiscountChange: (value: string) => void;
  onGlobalDiscountTypeChange: (
    discountType: CheckoutState['globalDiscountType'],
  ) => void;
  onShippingCostChange: (value: string) => void;
}) {
  return (
    <KolamCardFrame variant="checkoutAdjustment">
      <KolamCheckoutDiscountRow
        checkout={checkout}
        onGlobalDiscountChange={onGlobalDiscountChange}
        onGlobalDiscountTypeChange={onGlobalDiscountTypeChange}
      />
      <KolamCheckoutShippingField
        shippingCost={checkout.shippingCost}
        onShippingCostChange={onShippingCostChange}
      />
    </KolamCardFrame>
  );
}