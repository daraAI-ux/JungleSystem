import React from 'react';

export interface KolamMappedListProps<Item> {
  getKey: (item: Item, index: number) => React.Key;
  items: Item[];
  limit?: number;
  renderItem: (item: Item, index: number, visibleItems: Item[]) => React.ReactNode;
}

export function KolamMappedList<Item>({
  getKey,
  items,
  limit,
  renderItem,
}: KolamMappedListProps<Item>) {
  const visibleItems =
    typeof limit === 'number' ? items.slice(0, limit) : items;

  return (
    <>
      {visibleItems.map((item, index) => (
        <React.Fragment key={getKey(item, index)}>
          {renderItem(item, index, visibleItems)}
        </React.Fragment>
      ))}
    </>
  );
}
