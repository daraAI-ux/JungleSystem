import React from 'react';
import {KolamActionControlSet} from './kolam-action-control-set';

export function KolamAuthActionButtons({
  isSigningIn,
  onLogin,
  onLogout,
  onSync,
}: {
  isSigningIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
}) {
  return (
    <KolamActionControlSet
      actions={[
        {
          id: 'login',
          label: 'Login',
          loading: isSigningIn,
          loadingLabel: 'Login...',
          intent: 'primary',
          size: 'md',
          onPress: onLogin,
        },
        {
          id: 'sync',
          label: 'Sync',
          intent: 'outline',
          size: 'md',
          onPress: onSync,
        },
        {
          id: 'logout',
          label: 'Logout',
          intent: 'outline',
          size: 'md',
          onPress: onLogout,
        },
      ]}
    />
  );
}
