import React from 'react';
import {KolamSelectTrigger} from './kolam-select-trigger';
import type {KolamFilterBarControl} from './kolam-filter-bar-types';

export function KolamFilterSelectControl({
  control,
}: {
  control: KolamFilterBarControl;
}) {
  return (
    <KolamSelectTrigger
      accessibilityLabel={control.label}
      value={control.options?.[0]?.label ?? control.label}
      wide={control.triggerWidth === 'min-w-40'}
    />
  );
}
