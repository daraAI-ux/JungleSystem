import React from 'react';
import type {
  CartLine,
  CatalogItem,
  CatalogItemType,
  CheckoutState,
  Customer,
  PaymentMethod,
  SaleSummary,
} from '../domain/pos';
import type {WorkflowStep} from '../lib/workflow';
import {KolamCheckoutMetricsRow} from './kolam-checkout-metrics-row';
import {KolamCheckoutWorkspaceBody} from './kolam-checkout-workspace-body';
import {KolamSalesPanel} from './kolam-pos-widgets';

export interface KolamCheckoutWorkspaceProps {
  activeType: CatalogItemType | 'all';
  afterDiscount: number;
  canCreateDraft: boolean;
  catalog: CatalogItem[];
  catalogSearch: string;
  checkout: CheckoutState;
  customers: Customer[];
  filteredCatalog: CatalogItem[];
  finalTotal: number;
  isCreatingSale: boolean;
  onAddToCart: (item: CatalogItem) => void;
  onCatalogSearchChange: (query: string) => void;
  onClearCart: () => void;
  onCreateSaleDraft: () => void;
  onDiscountAmountChange: (itemId: string, value: string) => void;
  onDiscountTypeChange: (itemId: string, discountType: CartLine['discountType']) => void;
  onGlobalDiscountChange: (value: string) => void;
  onGlobalDiscountTypeChange: (discountType: CheckoutState['globalDiscountType']) => void;
  onQuantityChange: (itemId: string, nextQuantity: number) => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectPaymentMethod: (methodId: string) => void;
  onShippingCostChange: (value: string) => void;
  onTypeChange: (type: CatalogItemType | 'all') => void;
  paymentMethods: PaymentMethod[];
  recentSales: SaleSummary[];
  selectedCustomer?: Customer;
  selectedPayment?: PaymentMethod;
  subtotal: number;
  workflowSteps: WorkflowStep[];
}

export function KolamCheckoutWorkspace(props: KolamCheckoutWorkspaceProps) {
  return (
    <>
      <KolamCheckoutMetricsRow
        catalog={props.catalog}
        checkout={props.checkout}
        finalTotal={props.finalTotal}
      />
      <KolamCheckoutWorkspaceBody {...props} />
      <KolamSalesPanel sales={props.recentSales} />
    </>
  );
}
