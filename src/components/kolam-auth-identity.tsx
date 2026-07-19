import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {AccessScope} from '../domain/auth';
import {formatAccessScope} from '../domain/auth';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';

export function KolamAuthIdentity({
  accessScope,
  authMessage,
  authSourceHint,
  displayName,
}: {
  accessScope: AccessScope;
  authMessage: string;
  authSourceHint: string;
  displayName: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.authIdentity}
      items={[
        {id: 'label', text: 'Session', style: styles.authLabel},
        {id: 'user', text: displayName, style: styles.authUser},
        {id: 'message', text: authMessage, style: styles.authMessage},
        {
          id: 'access',
          text: `Akses: ${formatAccessScope(accessScope)}`,
          style: styles.authAccess,
        },
        {id: 'source', text: authSourceHint, style: styles.authSourceHint},
      ]}
    />
  );
}
