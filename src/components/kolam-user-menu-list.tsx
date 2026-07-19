import React from 'react';
import type {TopNavUserMenuItem} from '../domain/top-nav';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamUserMenuRow} from './kolam-user-menu-row';

export function KolamUserMenuList({
  items,
  onSelect,
}: {
  items: TopNavUserMenuItem[];
  onSelect: (item: TopNavUserMenuItem) => void;
}) {
  return (
    <KolamContentFrame variant="userMenuList">
      <KolamMappedList
        items={items}
        getKey={item => item.id}
        renderItem={(item, index, visibleItems) => {
          const previousItem = visibleItems[index - 1];
          const sectionStart =
            Boolean(previousItem) && previousItem.section !== item.section;

          return (
            <KolamUserMenuRow
              item={item}
              onSelect={onSelect}
              sectionStart={sectionStart}
            />
          );
        }}
      />
    </KolamContentFrame>
  );
}