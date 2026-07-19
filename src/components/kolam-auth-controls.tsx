import React from 'react';
import type {AuthSource, AuthSourceDescriptor} from '../domain/auth';
import {KolamAuthActionButtons} from './kolam-auth-action-buttons';
import {KolamAuthCredentialFields} from './kolam-auth-credential-fields';
import {KolamAuthSourcePicker} from './kolam-auth-source-picker';
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
}) {
  return (
    <KolamListFrame variant="authControls">
      <KolamAuthSourcePicker
        authSource={authSource}
        authSources={authSources}
        onAuthSourceChange={onAuthSourceChange}
      />
      <KolamAuthCredentialFields
        amApiBaseUrl={amApiBaseUrl}
        authEmail={authEmail}
        authPassword={authPassword}
        onAmApiBaseUrlChange={onAmApiBaseUrlChange}
        onAuthEmailChange={onAuthEmailChange}
        onAuthPasswordChange={onAuthPasswordChange}
      />
      <KolamAuthActionButtons
        isSigningIn={isSigningIn}
        onLogin={onLogin}
        onLogout={onLogout}
        onSync={onSync}
      />
    </KolamListFrame>
  );
}