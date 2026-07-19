import React from 'react';
import {KolamCheckoutSummaryPanel} from './kolam-checkout-summary-panel';
import type {KolamCheckoutWorkspaceBodyProps} from './kolam-checkout-workspace-body-types';

export function KolamCheckoutWorkspaceSummaryPane(
  props: KolamCheckoutWorkspaceBodyProps,
) {
  return (
    <KolamCheckoutSummaryPanel
      afterDiscount={props.afterDiscount}
      canCreateDraft={props.canCreateDraft}
      catalog={props.catalog}
      checkout={props.checkout}
      customers={props.customers}
      finalTotal={props.finalTotal}
      isCreatingSale={props.isCreatingSale}
      onClearCart={props.onClearCart}
      onCreateSaleDraft={props.onCreateSaleDraft}
      onDiscountAmountChange={props.onDiscountAmountChange}
      onDiscountTypeChange={props.onDiscountTypeChange}
      onGlobalDiscountChange={props.onGlobalDiscountChange}
      onGlobalDiscountTypeChange={props.onGlobalDiscountTypeChange}
      onQuantityChange={props.onQuantityChange}
      onSelectCustomer={props.onSelectCustomer}
      onSelectPaymentMethod={props.onSelectPaymentMethod}
      onShippingCostChange={props.onShippingCostChange}
      paymentMethods={props.paymentMethods}
      selectedCustomer={props.selectedCustomer}
      selectedPayment={props.selectedPayment}
      subtotal={props.subtotal}
      workflowSteps={props.workflowSteps}
    />
  );
}
