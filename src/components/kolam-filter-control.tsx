import React from 'react';
import type {KolamFilterBarControl} from './kolam-filter-bar-types';
import {KolamFilterSearchControl} from './kolam-filter-search-control';
import {KolamFilterSelectControl} from './kolam-filter-select-control';

export function KolamFilterControl({
  control,
}: {
  control: KolamFilterBarControl;
}) {
  return control.control === 'search' ? (
    <KolamFilterSearchControl control={control} />
  ) : (
    <KolamFilterSelectControl control={control} />
  );
}
