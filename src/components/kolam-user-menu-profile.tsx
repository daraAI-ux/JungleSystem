import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {AccessScope} from '../domain/auth';
import {userMenuPanelStyles as styles} from './kolam-user-menu-panel-styles';

export function KolamUserMenuProfile({
  accessScope: _accessScope,
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
      ]}
    />
  );
}
