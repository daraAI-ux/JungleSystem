import React from 'react';
import type {KolamFilterBarControl} from './kolam-filter-bar-types';
import {KolamFilterSearchControl} from './kolam-filter-search-control';
import {KolamFilterSelectControl} from './kolam-filter-select-control';

export function KolamFilterControl({
  control,
  value = '',
  onChange,
}: {
  control: KolamFilterBarControl;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return control.control === 'search' ? (
    <KolamFilterSearchControl
      control={control}
      value={value}
      onChange={onChange}
    />
  ) : (
    <KolamFilterSelectControl
      control={control}
      value={value}
      onChange={onChange}
    />
  );
}
