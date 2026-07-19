import React from 'react';
import type {CheckoutState, PaymentMethod} from '../domain/pos';
import {KolamPaymentSelector} from './kolam-pos-widgets';
import {KolamInfoBlock} from './kolam-info-block';

export function KolamCheckoutPaymentSection({
  checkout,
  paymentMethods,
  selectedPayment,
  onSelectPaymentMethod,
}: {
  checkout: CheckoutState;
  paymentMethods: PaymentMethod[];
  selectedPayment?: PaymentMethod;
  onSelectPaymentMethod: (methodId: string) => void;
}) {
  return (
    <>
      <KolamInfoBlock
        label="Payment"
        primary={selectedPayment?.name ?? '-'}
        secondary={selectedPayment?.wallet ?? '-'}
      />
      <KolamPaymentSelector
        methods={paymentMethods}
        selectedMethodId={checkout.paymentMethodId}
        onSelect={onSelectPaymentMethod}
      />
    </>
  );
}
