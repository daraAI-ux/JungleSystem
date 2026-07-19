import React from 'react';
import {KolamCustomerFormField} from './kolam-customer-form-field';
import {KolamCustomerSubmitButton} from './kolam-customer-submit-button';
import {KolamListFrame} from './kolam-list-frame';
import type {KolamCustomerModuleProps} from './kolam-customer-module-types';

type CustomerFormGridProps = Omit<KolamCustomerModuleProps, 'customers'>;

export function KolamCustomerFormGrid({
  customerForm,
  isCreatingCustomer,
  onCreateCustomer,
  onCustomerFormChange,
}: CustomerFormGridProps) {
  return (
    <KolamListFrame variant="formGrid">
      <KolamCustomerFormField
        value={customerForm.name}
        onChangeText={name => onCustomerFormChange({...customerForm, name})}
        placeholder="nama customer"
      />
      <KolamCustomerFormField
        value={customerForm.phone}
        onChangeText={phone => onCustomerFormChange({...customerForm, phone})}
        placeholder="telepon"
      />
      <KolamCustomerFormField
        value={customerForm.email}
        onChangeText={email => onCustomerFormChange({...customerForm, email})}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="email"
      />
      <KolamCustomerFormField
        value={customerForm.address}
        onChangeText={address =>
          onCustomerFormChange({...customerForm, address})
        }
        placeholder="alamat"
      />
      <KolamCustomerSubmitButton
        isCreatingCustomer={isCreatingCustomer}
        onCreateCustomer={onCreateCustomer}
      />
    </KolamListFrame>
  );
}