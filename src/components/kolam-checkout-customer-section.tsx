import React from 'react';
import type {CheckoutState, Customer} from '../domain/pos';
import {KolamCustomerSelector} from './kolam-pos-widgets';
import {KolamInfoBlock} from './kolam-info-block';

export function KolamCheckoutCustomerSection({
  checkout,
  customers,
  selectedCustomer,
  onSelectCustomer,
}: {
  checkout: CheckoutState;
  customers: Customer[];
  selectedCustomer?: Customer;
  onSelectCustomer: (customerId: string) => void;
}) {
  return (
    <>
      <KolamInfoBlock
        label="Customer"
        primary={selectedCustomer?.name ?? '-'}
        secondary={selectedCustomer?.phone ?? '-'}
      />
      <KolamCustomerSelector
        customers={customers}
        selectedCustomerId={checkout.customerId}
        onSelect={onSelectCustomer}
      />
    </>
  );
}
