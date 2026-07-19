import React from 'react';
import {
  KolamSelectorChipGroup,
  type KolamSelectorChipGroupProps,
  type KolamSelectorChipOption,
} from './kolam-selector-chip-group';

export interface KolamMappedSelectorChipGroupProps<Item>
  extends Omit<KolamSelectorChipGroupProps, 'options'> {
  getOption: (item: Item) => KolamSelectorChipOption;
  items: Item[];
}

export function KolamMappedSelectorChipGroup<Item>({
  getOption,
  items,
  ...props
}: KolamMappedSelectorChipGroupProps<Item>) {
  return (
    <KolamSelectorChipGroup
      {...props}
      options={items.map(item => getOption(item))}
    />
  );
}
