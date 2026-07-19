import React, {type ReactNode} from 'react';
import {View} from 'react-native';
import type {CheckoutState} from '../domain/pos';
import {formatRupiah} from '../lib/money';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamTotalRow} from './kolam-total-row';
import {checkoutSummaryStyles as styles} from './kolam-checkout-summary-styles';

export function KolamCheckoutTotalBox({
  adjustment,
  afterDiscount,
  checkout,
  finalTotal,
  subtotal,
}: {
  adjustment: ReactNode;
  afterDiscount: number;
  checkout: CheckoutState;
  finalTotal: number;
  subtotal: number;
}) {
  return (
    <KolamCardFrame variant="checkoutTotalBox">
      {adjustment}
      <KolamTotalRow label="Subtotal" value={formatRupiah(subtotal)} />
      <KolamTotalRow
        label="Diskon"
        value={formatRupiah(subtotal - afterDiscount)}
      />
      <KolamTotalRow
        label="Shipping"
        value={formatRupiah(checkout.shippingCost)}
      />
      <View style={styles.totalDivider} />
      <KolamTotalRow
        label="Final total"
        value={formatRupiah(finalTotal)}
        strong
      />
    </KolamCardFrame>
  );
}