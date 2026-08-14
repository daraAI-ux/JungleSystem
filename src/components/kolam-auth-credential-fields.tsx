import React from 'react';
import {Text, View} from 'react-native';
import type {
  KolamAuthLoginMode,
  KolamAuthOtpStep,
} from '../hooks/use-kolam-auth-controller';
import {KolamAuthEmailField} from './kolam-auth-email-field';
import {KolamAuthPasswordField} from './kolam-auth-password-field';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';
import {KolamAuthServerField} from './kolam-auth-server-field';
import {KolamFormTextField} from './kolam-form-text-field';

export function KolamAuthCredentialFields({
  amApiBaseUrl,
  authEmail,
  authLoginMode = 'password',
  authOtpCode = '',
  authOtpStep = 'email',
  authPassword,
  onAmApiBaseUrlChange,
  onAuthEmailChange,
  onAuthOtpCodeChange,
  onAuthPasswordChange,
  otpExpireMinutes,
  showServerField = true,
  variant = 'full',
}: {
  amApiBaseUrl: string;
  authEmail: string;
  authLoginMode?: KolamAuthLoginMode;
  authOtpCode?: string;
  authOtpStep?: KolamAuthOtpStep;
  authPassword: string;
  onAmApiBaseUrlChange: (value: string) => void;
  onAuthEmailChange: (value: string) => void;
  onAuthOtpCodeChange?: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
  otpExpireMinutes?: number;
  showServerField?: boolean;
  variant?: 'full' | 'login';
}) {
  const inputStyle =
    variant === 'login' ? styles.authInputLogin : styles.authInput;

  return (
    <>
      <KolamAuthEmailField
        authEmail={authEmail}
        onAuthEmailChange={onAuthEmailChange}
        style={inputStyle}
      />
      {authLoginMode === 'otp' ? (
        authOtpStep === 'code' ? (
          <KolamFormTextField
            maxLength={6}
            mode="numeric"
            onChangeText={value =>
              onAuthOtpCodeChange?.(value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="Kode OTP"
            style={inputStyle}
            value={authOtpCode}
          />
        ) : (
          <View style={styles.authOtpHintBox}>
            <Text style={styles.authOtpHintText}>
              Kode 6 digit dikirim ke email akun staff.
            </Text>
            <Text style={styles.authOtpHintText}>
              Berlaku {otpExpireMinutes ?? 10} menit.
            </Text>
          </View>
        )
      ) : (
        <KolamAuthPasswordField
          authPassword={authPassword}
          onAuthPasswordChange={onAuthPasswordChange}
          style={inputStyle}
        />
      )}
      {showServerField ? (
        <KolamAuthServerField
          amApiBaseUrl={amApiBaseUrl}
          onAmApiBaseUrlChange={onAmApiBaseUrlChange}
        />
      ) : null}
    </>
  );
}
