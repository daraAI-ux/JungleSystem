import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';
import {customerModuleStyles as styles} from './kolam-customer-module-styles';

export function KolamCustomerSubmitButton({
  isCreatingCustomer,
  onCreateCustomer,
}: {
  isCreatingCustomer: boolean;
  onCreateCustomer: () => void;
}) {
  return (
    <KolamActionControlButton
      label="Buat customer"
      loading={isCreatingCustomer}
      loadingLabel="Menyimpan..."
      intent="primary"
      size="md"
      onPress={onCreateCustomer}
      style={styles.formSubmitControl}
    />
  );
}
