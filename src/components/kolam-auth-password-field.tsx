import React from 'react';
import {KolamFormTextField} from './kolam-form-text-field';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';

export function KolamAuthPasswordField({
  authPassword,
  onAuthPasswordChange,
}: {
  authPassword: string;
  onAuthPasswordChange: (value: string) => void;
}) {
  return (
    <KolamFormTextField
      value={authPassword}
      onChangeText={onAuthPasswordChange}
      mode="password"
      placeholder="password"
      style={styles.authInput}
    />
  );
}
