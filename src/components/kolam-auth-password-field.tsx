import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamFormTextField} from './kolam-form-text-field';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';
import {KolamIconButton} from './kolam-icon-button';
import {KolamTableEyeIcon} from './kolam-table-action-button';

export function KolamAuthPasswordField({
  authPassword,
  onAuthPasswordChange,
  style,
}: {
  authPassword: string;
  onAuthPasswordChange: (value: string) => void;
  style?: StyleProp<TextStyle>;
}) {
  const [passwordVisible, setPasswordVisible] = React.useState(false);

  return (
    <View style={styles.authPasswordField}>
      <KolamFormTextField
        value={authPassword}
        onChangeText={onAuthPasswordChange}
        mode="password"
        placeholder="Kata sandi"
        secureTextEntry={!passwordVisible}
        style={[
          style ?? styles.authInput,
          styles.authPasswordInputWithReveal,
        ]}
      />
      <KolamIconButton
        accessibilityLabel={
          passwordVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
        }
        onPress={() => setPasswordVisible(value => !value)}
        radius="md"
        size={28}
        style={styles.authPasswordRevealButton}
        variant="ghost">
        <KolamTableEyeIcon
          color={passwordVisible ? V.colors.primary : V.colors.mutedFg}
        />
      </KolamIconButton>
    </View>
  );
}
