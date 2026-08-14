import React from 'react';
import {StyleSheet} from 'react-native';
import type {
  KolamAuthLoginMode,
  KolamAuthOtpStep,
} from '../hooks/use-kolam-auth-controller';
import {KolamActionControlSet} from './kolam-action-control-set';

export function KolamAuthActionButtons({
  isRequestingOtp = false,
  isSigningIn,
  loginMode = 'password',
  onLogin,
  onLogout,
  onRequestOtp,
  onSync,
  onVerifyOtp,
  otpStep = 'email',
  showSecondaryActions = true,
}: {
  isRequestingOtp?: boolean;
  isSigningIn: boolean;
  loginMode?: KolamAuthLoginMode;
  onLogin: () => void;
  onLogout: () => void;
  onRequestOtp?: () => void;
  onSync: () => void;
  onVerifyOtp?: () => void;
  otpStep?: KolamAuthOtpStep;
  showSecondaryActions?: boolean;
}) {
  const otpMode = loginMode === 'otp';
  const primaryLoading = otpMode
    ? otpStep === 'email'
      ? isRequestingOtp
      : isSigningIn
    : isSigningIn;
  const primaryLabel = otpMode
    ? otpStep === 'email'
      ? 'Kirim kode OTP'
      : 'Masuk dengan OTP'
    : 'Masuk';
  const primaryLoadingLabel = otpMode
    ? otpStep === 'email'
      ? 'Mengirim...'
      : 'Masuk...'
    : 'Masuk...';
  const primaryAction = otpMode
    ? otpStep === 'email'
      ? onRequestOtp
      : onVerifyOtp
    : onLogin;

  return (
    <KolamActionControlSet
      actions={[
        {
          id: 'login',
          label: primaryLabel,
          loading: primaryLoading,
          loadingLabel: primaryLoadingLabel,
          intent: 'primary',
          size: 'md',
          style: showSecondaryActions ? undefined : styles.loginButton,
          onPress: primaryAction ?? onLogin,
        },
        ...(showSecondaryActions
          ? [
              {
                id: 'sync',
                label: 'Sinkron',
                intent: 'outline' as const,
                size: 'md' as const,
                onPress: onSync,
              },
              {
                id: 'logout',
                label: 'Keluar',
                intent: 'outline' as const,
                size: 'md' as const,
                onPress: onLogout,
              },
            ]
          : []),
      ]}
    />
  );
}

const styles = StyleSheet.create({
  loginButton: {
    width: '100%',
  },
});
