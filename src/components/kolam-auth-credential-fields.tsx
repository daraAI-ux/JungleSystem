import React from 'react';
import {KolamAuthEmailField} from './kolam-auth-email-field';
import {KolamAuthPasswordField} from './kolam-auth-password-field';
import {KolamAuthServerField} from './kolam-auth-server-field';

export function KolamAuthCredentialFields({
  amApiBaseUrl,
  authEmail,
  authPassword,
  onAmApiBaseUrlChange,
  onAuthEmailChange,
  onAuthPasswordChange,
}: {
  amApiBaseUrl: string;
  authEmail: string;
  authPassword: string;
  onAmApiBaseUrlChange: (value: string) => void;
  onAuthEmailChange: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
}) {
  return (
    <>
      <KolamAuthEmailField
        authEmail={authEmail}
        onAuthEmailChange={onAuthEmailChange}
      />
      <KolamAuthPasswordField
        authPassword={authPassword}
        onAuthPasswordChange={onAuthPasswordChange}
      />
      <KolamAuthServerField
        amApiBaseUrl={amApiBaseUrl}
        onAmApiBaseUrlChange={onAmApiBaseUrlChange}
      />
    </>
  );
}
