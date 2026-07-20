import React from 'react';
import type {AuthSource, AuthSourceDescriptor} from '../domain/auth';
import {KolamAuthActionButtons} from './kolam-auth-action-buttons';
import {KolamAuthCredentialFields} from './kolam-auth-credential-fields';
import {KolamAuthSourcePicker} from './kolam-auth-source-picker';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';
import {KolamListFrame} from './kolam-list-frame';

export function KolamAuthControls({
  amApiBaseUrl,
  authEmail,
  authPassword,
  authSource,
  authSources,
  isSigningIn,
  onAmApiBaseUrlChange,
  onAuthEmailChange,
  onAuthPasswordChange,
  onAuthSourceChange,
  onLogin,
  onLogout,
  onSync,
  variant = 'full',
}: {
  amApiBaseUrl: string;
  authEmail: string;
  authPassword: string;
  authSource: AuthSource;
  authSources: AuthSourceDescriptor[];
  isSigningIn: boolean;
  onAmApiBaseUrlChange: (value: string) => void;
  onAuthEmailChange: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
  onAuthSourceChange: (source: AuthSource) => void;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
  variant?: 'full' | 'login';
}) {
  const compactLogin = variant === 'login';

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
      <KolamAuthCredentialFields
        amApiBaseUrl={amApiBaseUrl}
        authEmail={authEmail}
        authPassword={authPassword}
        onAmApiBaseUrlChange={onAmApiBaseUrlChange}
        onAuthEmailChange={onAuthEmailChange}
        onAuthPasswordChange={onAuthPasswordChange}
        showServerField={!compactLogin}
        variant={variant}
      />
      <KolamAuthActionButtons
        isSigningIn={isSigningIn}
        onLogin={onLogin}
        onLogout={onLogout}
        onSync={onSync}
        showSecondaryActions={!compactLogin}
      />
    </KolamListFrame>
  );
}
