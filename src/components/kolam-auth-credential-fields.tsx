import React from 'react';
import {KolamAuthEmailField} from './kolam-auth-email-field';
import {KolamAuthPasswordField} from './kolam-auth-password-field';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';
import {KolamAuthServerField} from './kolam-auth-server-field';

export function KolamAuthCredentialFields({
  amApiBaseUrl,
  authEmail,
  authPassword,
  onAmApiBaseUrlChange,
  onAuthEmailChange,
  onAuthPasswordChange,
  showServerField = true,
  variant = 'full',
}: {
  amApiBaseUrl: string;
  authEmail: string;
  authPassword: string;
  onAmApiBaseUrlChange: (value: string) => void;
  onAuthEmailChange: (value: string) => void;
  onAuthPasswordChange: (value: string) => void;
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
      <KolamAuthPasswordField
        authPassword={authPassword}
        onAuthPasswordChange={onAuthPasswordChange}
        style={inputStyle}
      />
      {showServerField ? (
        <KolamAuthServerField
          amApiBaseUrl={amApiBaseUrl}
          onAmApiBaseUrlChange={onAmApiBaseUrlChange}
        />
      ) : null}
    </>
  );
}
