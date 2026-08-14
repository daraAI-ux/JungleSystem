import React from 'react';
import {KolamAuthControls} from './kolam-auth-controls';
import {KolamAuthIdentity} from './kolam-auth-identity';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';
import {KolamPanelFrame} from './kolam-panel-frame';
import type {KolamAuthPanelProps} from './kolam-auth-panel-types';

export function KolamAuthPanel({
  accessScope,
  amApiBaseUrl,
  authEmail,
  authLoginMode = 'password',
  authMessage,
  authOtpCode = '',
  authOtpConfig = null,
  authOtpStep = 'email',
  authPassword,
  authSource,
  authSourceHint,
  authSources,
  displayName,
  isRequestingOtp = false,
  isSigningIn,
  onAmApiBaseUrlChange,
  onAuthEmailChange,
  onAuthLoginModeChange,
  onAuthOtpCodeChange,
  onAuthOtpStepChange,
  onAuthPasswordChange,
  onAuthSourceChange,
  onLogin,
  onLogout,
  onRequestOtp,
  onSync,
  onVerifyOtp,
  variant = 'full',
}: KolamAuthPanelProps & {variant?: 'full' | 'login'}) {
  const compactLogin = variant === 'login';

  return (
    <KolamPanelFrame
      variant="auth"
      style={compactLogin ? styles.authPanelLogin : undefined}>
      {!compactLogin ? (
        <KolamAuthIdentity
          accessScope={accessScope}
          authMessage={authMessage}
          authSourceHint={authSourceHint}
          displayName={displayName}
        />
      ) : null}
      <KolamAuthControls
        amApiBaseUrl={amApiBaseUrl}
        authEmail={authEmail}
        authLoginMode={authLoginMode}
        authOtpCode={authOtpCode}
        authOtpConfig={authOtpConfig}
        authOtpStep={authOtpStep}
        authPassword={authPassword}
        authSource={authSource}
        authSources={authSources}
        isRequestingOtp={isRequestingOtp}
        isSigningIn={isSigningIn}
        onAmApiBaseUrlChange={onAmApiBaseUrlChange}
        onAuthEmailChange={onAuthEmailChange}
        onAuthLoginModeChange={onAuthLoginModeChange}
        onAuthOtpCodeChange={onAuthOtpCodeChange}
        onAuthOtpStepChange={onAuthOtpStepChange}
        onAuthPasswordChange={onAuthPasswordChange}
        onAuthSourceChange={onAuthSourceChange}
        onLogin={onLogin}
        onLogout={onLogout}
        onRequestOtp={onRequestOtp}
        onSync={onSync}
        onVerifyOtp={onVerifyOtp}
        variant={variant}
      />
    </KolamPanelFrame>
  );
}
