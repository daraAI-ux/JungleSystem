import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {KolamFormTextField} from './kolam-form-text-field';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';

export function KolamAuthPasswordField({
  authPassword,
  onAuthPasswordChange,
  style,
}: {
  authPassword: string;
  onAuthPasswordChange: (value: string) => void;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <KolamFormTextField
      value={authPassword}
      onChangeText={onAuthPasswordChange}
      mode="password"
      placeholder="Kata sandi"
      style={style ?? styles.authInput}
    />
  );
}
