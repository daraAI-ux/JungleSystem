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
  authMessage,
  authPassword,
  authSource,
  authSourceHint,
  authSources,
  displayName,
  isSigningIn,
  onAmApiBaseUrlChange,
  onAuthEmailChange,
  onAuthPasswordChange,
  onAuthSourceChange,
  onLogin,
  onLogout,
  onSync,
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
        authPassword={authPassword}
        authSource={authSource}
        authSources={authSources}
        isSigningIn={isSigningIn}
        onAmApiBaseUrlChange={onAmApiBaseUrlChange}
        onAuthEmailChange={onAuthEmailChange}
        onAuthPasswordChange={onAuthPasswordChange}
        onAuthSourceChange={onAuthSourceChange}
        onLogin={onLogin}
        onLogout={onLogout}
        onSync={onSync}
        variant={variant}
      />
    </KolamPanelFrame>
  );
}
