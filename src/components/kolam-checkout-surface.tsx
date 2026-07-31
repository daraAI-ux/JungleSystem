import React from 'react';
import type {
  KolamCheckoutSurfaceProps,
  KolamCustomerSurfaceProps,
} from './kolam-workspace-module-surface-types';
import {KolamPosFullWindowSurface} from './kolam-pos-full-window-surface';

export function KolamCheckoutSurface({
  checkout,
  customer,
  onBackToCenter,
}: {
  checkout: KolamCheckoutSurfaceProps;
  customer: KolamCustomerSurfaceProps;
  onBackToCenter: () => void;
}) {
  return (
    <KolamPosFullWindowSurface
      {...checkout}
      customerForm={customer.customerForm}
      isCreatingCustomer={customer.isCreatingCustomer}
      onBackToCenter={onBackToCenter}
      onCreateCustomer={customer.onCreateCustomer}
      onCustomerFormChange={customer.onCustomerFormChange}
    />
  );
}
