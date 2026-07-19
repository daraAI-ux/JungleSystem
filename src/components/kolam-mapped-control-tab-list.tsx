import React from 'react';
import {
  KolamControlTabList,
  type KolamControlTabListItem,
  type KolamControlTabListProps,
} from './kolam-control-tab-list';

export interface KolamMappedControlTabListProps<Item>
  extends Omit<KolamControlTabListProps, 'items'> {
  getItem: (item: Item) => KolamControlTabListItem;
  items: Item[];
}

export function KolamMappedControlTabList<Item>({
  getItem,
  items,
  ...props
}: KolamMappedControlTabListProps<Item>) {
  return (
    <KolamControlTabList
      {...props}
      items={items.map(item => getItem(item))}
    />
  );
}
