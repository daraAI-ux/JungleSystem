import React from 'react';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamStatePill} from './kolam-state-pill';
import type {KolamStatePillGroupProps} from './kolam-state-pill-group-types';

export type {
  KolamStatePillGroupItem,
  KolamStatePillGroupProps,
} from './kolam-state-pill-group-types';

export function KolamStatePillGroup({
  accessibilityLabel,
  items,
}: KolamStatePillGroupProps) {
  return (
    <KolamListFrame variant="pill" accessibilityLabel={accessibilityLabel}>
      <KolamMappedList
        items={items}
        getKey={item => item.id}
        renderItem={item => <KolamStatePill item={item} />}
      />
    </KolamListFrame>
  );
}
