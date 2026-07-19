import React from 'react';
import {KolamRowFrame} from './kolam-row-frame';
import {KolamSwitch} from './kolam-switch';
import {KolamToggleRowCopy} from './kolam-toggle-row-copy';
import type {KolamToggleRowProps} from './kolam-toggle-row-types';

export type {KolamToggleRowProps} from './kolam-toggle-row-types';

export function KolamToggleRow({
  active,
  description,
  label,
  onPress,
}: KolamToggleRowProps) {
  return (
    <KolamRowFrame>
      <KolamToggleRowCopy description={description} label={label} />
      <KolamSwitch active={active} onPress={onPress} />
    </KolamRowFrame>
  );
}
