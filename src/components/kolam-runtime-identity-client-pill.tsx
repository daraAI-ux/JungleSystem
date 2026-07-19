import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {appConfig} from '../config/app';
import {runtimeIdentityStyles as styles} from './kolam-runtime-identity-styles';

export function KolamRuntimeIdentityClientPill() {
  return (
    <KolamCopyStack
      containerStyle={styles.runtimeIdentityClientPill}
      items={[
        {
          id: 'client',
          text: appConfig.nativeClientId,
          style: styles.runtimeIdentityClientText,
        },
      ]}
    />
  );
}
