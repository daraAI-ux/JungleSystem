import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {avatarPillListStyles as styles} from './kolam-avatar-pill-list-styles';
import type {KolamAvatarPillItem} from './kolam-avatar-pill-list-types';

export function KolamAvatarPill({item}: {item: KolamAvatarPillItem}) {
  return (
    <KolamInlineFrame variant="avatarPill">
      <KolamCopyStack
        items={[
          {id: 'initials', text: item.initials, style: styles.avatar},
          {id: 'name', text: item.name, style: styles.name},
        ]}
      />
    </KolamInlineFrame>
  );
}