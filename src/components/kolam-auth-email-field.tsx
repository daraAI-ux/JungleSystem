import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {KolamFormTextField} from './kolam-form-text-field';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';

export function KolamAuthEmailField({
  authEmail,
  onAuthEmailChange,
  style,
}: {
  authEmail: string;
  onAuthEmailChange: (value: string) => void;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <KolamFormTextField
      value={authEmail}
      onChangeText={onAuthEmailChange}
      mode="email"
      placeholder="email anda"
      style={style ?? styles.authInput}
    />
  );
}
