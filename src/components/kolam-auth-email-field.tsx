import React from 'react';
import {KolamFormTextField} from './kolam-form-text-field';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';

export function KolamAuthEmailField({
  authEmail,
  onAuthEmailChange,
}: {
  authEmail: string;
  onAuthEmailChange: (value: string) => void;
}) {
  return (
    <KolamFormTextField
      value={authEmail}
      onChangeText={onAuthEmailChange}
      mode="email"
      placeholder="email kasir"
      style={styles.authInput}
    />
  );
}
