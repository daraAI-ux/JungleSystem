import React from 'react';
import {Pressable, Text, View} from 'react-native';
import type {AuthSource, AuthSourceDescriptor} from '../domain/auth';
import type {
  KolamAuthLoginMode,
  KolamAuthOtpStep,
} from '../hooks/use-kolam-auth-controller';
import type {StaffOtpLoginConfig} from '../services/auth-api';
import {KolamAuthActionButtons} from './kolam-auth-action-buttons';
import {KolamAuthCredentialFields} from './kolam-auth-credential-fields';
import {KolamAuthSourcePicker} from './kolam-auth-source-picker';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';
import {KolamListFrame} from './kolam-list-frame';

export function KolamAuthControls({
  amApiBaseUrl,
  authEmail,
  authLoginMode,
  authOtpCode,
  authOtpConfig,
  authOtpStep,
  authPassword,
  authSource,
  authSources,
  isRequestingOtp,
  isSigningIn,
  onAmApiBaseUrlChange,
  onAuthEmailChange,
  onAuthLoginModeChange = noop,
  onAuthOtpCodeChange = noop,
  onAuthOtpStepChange = noopOtpStep,
  onAuthPasswordChange,
  onAuthSourceChange,
  onLogin,
  onLogout,
  onRequestOtp,
  onSync,
  onVerifyOtp,
  variant = 'full',
}: {
  amApiBaseUrl: string;
  authEmail: string;
  authLoginMode: KolamAuthLoginMode;
  authOtpCode: string;
  authOtpConfig: StaffOtpLoginConfig | null;
  authOtpStep: KolamAuthOtpStep;
  authPassword: string;
  authSource: AuthSource;
  authSources: AuthSourceDescriptor[];
  isRequestingOtp: boolean;
  isSigningIn: boolean;
  onAmApiBaseUrlChange: (value: string) => void;
  onAuthEmailChange: (value: string) => void;
  onAuthLoginModeChange?: (value: KolamAuthLoginMode) => void;
  onAuthOtpCodeChange?: (value: string) => void;
  onAuthOtpStepChange?: (value: KolamAuthOtpStep) => void;
  onAuthPasswordChange: (value: string) => void;
  onAuthSourceChange: (source: AuthSource) => void;
  onLogin: () => void;
  onLogout: () => void;
  onRequestOtp?: () => void;
  onSync: () => void;
  onVerifyOtp?: () => void;
  variant?: 'full' | 'login';
}) {
  const compactLogin = variant === 'login';
  const otpAvailable =
    (compactLogin || authSource === 'kolam') && authOtpConfig?.enabled === true;
  const effectiveLoginMode = otpAvailable ? authLoginMode : 'password';

  const handleModeChange = (mode: KolamAuthLoginMode) => {
    onAuthLoginModeChange(mode);
    if (mode === 'password') {
      onAuthOtpStepChange('email');
      onAuthOtpCodeChange('');
    }
  };

  return (
    <KolamListFrame
      variant="authControls"
      style={compactLogin ? styles.authControlsLogin : undefined}>
      {!compactLogin ? (
        <KolamAuthSourcePicker
          authSource={authSource}
          authSources={authSources}
          onAuthSourceChange={onAuthSourceChange}
        />
      ) : null}
      {otpAvailable ? (
        <View style={styles.authModeTabs}>
          <AuthModeTab
            active={effectiveLoginMode === 'password'}
            label="Password"
            onPress={() => handleModeChange('password')}
          />
          <AuthModeTab
            active={effectiveLoginMode === 'otp'}
            label="OTP Email"
            onPress={() => handleModeChange('otp')}
          />
        </View>
      ) : null}
      <KolamAuthCredentialFields
        amApiBaseUrl={amApiBaseUrl}
        authEmail={authEmail}
        authLoginMode={effectiveLoginMode}
        authOtpCode={authOtpCode}
        authOtpStep={authOtpStep}
        authPassword={authPassword}
        onAmApiBaseUrlChange={onAmApiBaseUrlChange}
        onAuthEmailChange={onAuthEmailChange}
        onAuthOtpCodeChange={onAuthOtpCodeChange}
        onAuthPasswordChange={onAuthPasswordChange}
        otpExpireMinutes={authOtpConfig?.otpExpireMinutes}
        showServerField={!compactLogin}
        variant={variant}
      />
      {effectiveLoginMode === 'otp' && authOtpStep === 'code' ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            onAuthOtpStepChange('email');
            onAuthOtpCodeChange('');
          }}
          style={styles.authOtpBackButton}>
          <Text style={styles.authOtpBackText}>Ganti email atau kirim ulang</Text>
        </Pressable>
      ) : null}
      <KolamAuthActionButtons
        isRequestingOtp={isRequestingOtp}
        isSigningIn={isSigningIn}
        loginMode={effectiveLoginMode}
        onLogin={onLogin}
        onLogout={onLogout}
        onRequestOtp={onRequestOtp}
        onSync={onSync}
        onVerifyOtp={onVerifyOtp}
        otpStep={authOtpStep}
        showSecondaryActions={!compactLogin}
      />
    </KolamListFrame>
  );
}

function noop() {}

function noopOtpStep(_value: KolamAuthOtpStep) {}

function AuthModeTab({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.authModeTab, active ? styles.authModeTabActive : null]}>
      <Text
        style={[
          styles.authModeTabText,
          active ? styles.authModeTabTextActive : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}
