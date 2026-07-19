import React from 'react';
import {KolamInteractivePillFrame} from './kolam-interactive-pill-frame';
import {KolamSelectorChipLabel} from './kolam-selector-chip-label';
import type {KolamSelectorChipProps} from './kolam-selector-chip-types';

export type {KolamSelectorChipProps} from './kolam-selector-chip-types';

export function KolamSelectorChip({
  label,
  active,
  onPress,
}: KolamSelectorChipProps) {
  return (
    <KolamInteractivePillFrame
      accessibilityState={{selected: active}}
      onPress={onPress}
      selected={active}
      variant="selector">
      <KolamSelectorChipLabel active={active} label={label} />
    </KolamInteractivePillFrame>
  );
}
