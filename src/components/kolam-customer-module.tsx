import React from 'react';
import {Text} from 'react-native';
import {getKolamFormSection} from '../domain/kolam-form';
import type {Customer} from '../domain/pos';
import {KolamModulePanel} from './kolam-surface-widgets';
import {KolamNativeFormSection} from './kolam-native-form-section';
import {KolamCustomerFormGrid} from './kolam-customer-form-grid';
import {
  KolamListTableComposition,
  kolamListTableCompositionStyles,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import type {KolamCustomerModuleProps} from './kolam-customer-module-types';

const CUSTOMER_COLUMNS: Array<KolamListTableColumn<Customer>> = [
  {
    id: 'name',
    label: 'Pelanggan',
    flex: 1.4,
    render: customer => (
      <>
        <Text
          numberOfLines={1}
          style={kolamListTableCompositionStyles.primaryText}>
          {customer.name}
        </Text>
        <Text
          numberOfLines={1}
          style={kolamListTableCompositionStyles.metaText}>
          {customer.address || '-'}
        </Text>
      </>
    ),
  },
  {
    id: 'phone',
    label: 'Telepon',
    flex: 1,
    render: customer => (
      <Text
        numberOfLines={1}
        style={kolamListTableCompositionStyles.primaryText}>
        {customer.phone || '-'}
      </Text>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    flex: 1.1,
    render: customer => (
      <Text
        numberOfLines={1}
        style={kolamListTableCompositionStyles.primaryText}>
        {customer.email || '-'}
      </Text>
    ),
  },
];

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
      <KolamListTableComposition
        columns={CUSTOMER_COLUMNS}
        emptyTitle="Belum ada customer"
        getRowKey={customer => customer.id}
        rows={customers}
        showFooter={false}
      />
    </KolamModulePanel>
  );
}
