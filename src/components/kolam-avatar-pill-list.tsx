import React from 'react';
import {KolamAvatarPill} from './kolam-avatar-pill';
import {KolamAvatarPillEmpty} from './kolam-avatar-pill-empty';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import type {KolamAvatarPillListProps} from './kolam-avatar-pill-list-types';

export type {
  KolamAvatarPillItem,
  KolamAvatarPillListProps,
} from './kolam-avatar-pill-list-types';

export function KolamAvatarPillList({
  accessibilityLabel,
  emptyLabel = 'No items yet',
  items,
}: KolamAvatarPillListProps) {
  if (!items.length) {
    return <KolamAvatarPillEmpty label={emptyLabel} />;
  }

  return (
    <KolamListFrame variant="avatar" accessibilityLabel={accessibilityLabel}>
      <KolamMappedList
        items={items}
        getKey={item => item.id}
        renderItem={item => <KolamAvatarPill item={item} />}
      />
    </KolamListFrame>
  );
}
