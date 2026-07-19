import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {formatAccessScope, type AccessScope} from '../domain/auth';
import {userMenuPanelStyles as styles} from './kolam-user-menu-panel-styles';

export function KolamUserMenuProfile({
  accessScope,
  displayName,
  email,
}: {
  accessScope: AccessScope;
  displayName: string;
  email: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.userMenuProfile}
      items={[
        {id: 'name', text: displayName, style: styles.userMenuName},
        {id: 'email', text: email, style: styles.userMenuEmail},
        {
          id: 'scope',
          text: formatAccessScope(accessScope),
          style: styles.userMenuScope,
        },
      ]}
    />
  );
}
