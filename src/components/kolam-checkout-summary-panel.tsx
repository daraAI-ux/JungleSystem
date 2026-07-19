import React from 'react';
import {KolamCheckoutAdjustmentBox} from './kolam-checkout-adjustment-box';
import {KolamCheckoutCartList} from './kolam-checkout-cart-list';
import {KolamCheckoutCustomerSection} from './kolam-checkout-customer-section';
import {KolamCheckoutPaymentSection} from './kolam-checkout-payment-section';
import {KolamCheckoutSubmitButton} from './kolam-checkout-submit-button';
import {KolamCheckoutSummaryHeader} from './kolam-checkout-summary-header';
import type {KolamCheckoutSummaryPanelProps} from './kolam-checkout-summary-types';
import {KolamCheckoutTotalBox} from './kolam-checkout-total-box';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamWorkflowNotice} from './kolam-workflow-notice';

export function KolamCheckoutSummaryPanel({
  afterDiscount,
  canCreateDraft,
  catalog,
  checkout,
  customers,
  finalTotal,
  isCreatingSale,
  onClearCart,
  onCreateSaleDraft,
  onDiscountAmountChange,
  onDiscountTypeChange,
  onGlobalDiscountChange,
  onGlobalDiscountTypeChange,
  onQuantityChange,
  onSelectCustomer,
  onSelectPaymentMethod,
  onShippingCostChange,
  paymentMethods,
  selectedCustomer,
  selectedPayment,
  subtotal,
  workflowSteps,
}: KolamCheckoutSummaryPanelProps) {
  return (
    <KolamContentFrame variant="checkoutPane">
      <KolamCheckoutSummaryHeader
        cartItemCount={checkout.cart.length}
        onClearCart={onClearCart}
      />
      <KolamCheckoutCustomerSection
        checkout={checkout}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={onSelectCustomer}
      />
      <KolamCheckoutPaymentSection
        checkout={checkout}
        paymentMethods={paymentMethods}
        selectedPayment={selectedPayment}
        onSelectPaymentMethod={onSelectPaymentMethod}
      />
      <KolamWorkflowNotice steps={workflowSteps} />
      <KolamCheckoutCartList
        cart={checkout.cart}
        catalog={catalog}
        onDiscountAmountChange={onDiscountAmountChange}
        onDiscountTypeChange={onDiscountTypeChange}
        onQuantityChange={onQuantityChange}
      />
      <KolamCheckoutTotalBox
        afterDiscount={afterDiscount}
        checkout={checkout}
        finalTotal={finalTotal}
        subtotal={subtotal}
        adjustment={
          <KolamCheckoutAdjustmentBox
            checkout={checkout}
            onGlobalDiscountChange={onGlobalDiscountChange}
            onGlobalDiscountTypeChange={onGlobalDiscountTypeChange}
            onShippingCostChange={onShippingCostChange}
          />
        }
      />
      <KolamCheckoutSubmitButton
        canCreateDraft={canCreateDraft}
        isCreatingSale={isCreatingSale}
        onCreateSaleDraft={onCreateSaleDraft}
      />
    </KolamContentFrame>
  );
}