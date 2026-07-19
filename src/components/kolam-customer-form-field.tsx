import React from 'react';
import type {TextInputProps} from 'react-native';
import {KolamFormTextField} from './kolam-form-text-field';
import {customerModuleStyles as styles} from './kolam-customer-module-styles';

export function KolamCustomerFormField(props: TextInputProps) {
  return (
    <KolamFormTextField
      {...props}
      style={[styles.formInput, props.style]}
    />
  );
}
