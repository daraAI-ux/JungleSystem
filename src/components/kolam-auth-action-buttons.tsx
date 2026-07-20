import React from 'react';
import {StyleSheet} from 'react-native';
import {KolamActionControlSet} from './kolam-action-control-set';

export function KolamAuthActionButtons({
  isSigningIn,
  onLogin,
  onLogout,
  onSync,
  showSecondaryActions = true,
}: {
  isSigningIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
  showSecondaryActions?: boolean;
}) {
  return (
    <KolamActionControlSet
      actions={[
        {
          id: 'login',
          label: 'Masuk',
          loading: isSigningIn,
          loadingLabel: 'Masuk...',
          intent: 'primary',
          size: 'md',
          style: showSecondaryActions ? undefined : styles.loginButton,
          onPress: onLogin,
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
