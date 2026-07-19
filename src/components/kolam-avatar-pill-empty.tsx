import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {avatarPillListStyles as styles} from './kolam-avatar-pill-list-styles';

export function KolamAvatarPillEmpty({label}: {label: string}) {
  return (
    <KolamCopyStack items={[{id: 'empty', text: label, style: styles.empty}]} />
  );
}
