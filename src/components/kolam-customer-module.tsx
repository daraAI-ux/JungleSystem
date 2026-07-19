import React from 'react';
import {getKolamFormSection} from '../domain/kolam-form';
import {KolamModulePanel} from './kolam-surface-widgets';
import {KolamNativeFormSection} from './kolam-native-form-section';
import {KolamCustomerFormGrid} from './kolam-customer-form-grid';
import {KolamCustomerTable} from './kolam-customer-table';
import type {KolamCustomerModuleProps} from './kolam-customer-module-types';

export function KolamCustomerModule({
  customerForm,
  customers,
  isCreatingCustomer,
  onCreateCustomer,
  onCustomerFormChange,
}: KolamCustomerModuleProps) {
  return (
    <KolamModulePanel
      title="Customer"
      hint="Sale selalu membutuhkan customer, termasuk pembeli walk-in.">
      <KolamNativeFormSection section={getKolamFormSection('customer-create')}>
        <KolamCustomerFormGrid
          customerForm={customerForm}
          isCreatingCustomer={isCreatingCustomer}
          onCreateCustomer={onCreateCustomer}
          onCustomerFormChange={onCustomerFormChange}
        />
      </KolamNativeFormSection>
      <KolamCustomerTable customers={customers} />
    </KolamModulePanel>
  );
}
