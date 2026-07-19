import React from 'react';
import type {TopNavUserMenuItem} from '../domain/top-nav';
import {KolamUserMenuIcon} from './kolam-user-menu-icon';
import {KolamUserMenuItem} from './kolam-user-menu-item';
import {KolamUserMenuChevron} from './kolam-user-menu-chevron';

export function KolamUserMenuRow({
  item,
  onSelect,
  sectionStart,
}: {
  item: TopNavUserMenuItem;
  onSelect: (item: TopNavUserMenuItem) => void;
  sectionStart: boolean;
}) {
  const danger = item.id === 'logout';

  return (
    <KolamUserMenuItem
      danger={danger}
      icon={<KolamUserMenuIcon kind={item.iconKind} danger={danger} />}
      label={item.label}
      onPress={() => onSelect(item)}
      routeHint={item.routeHint}
      sectionStart={sectionStart}
      trailing={<KolamUserMenuChevron item={item} />}
    />
  );
}
