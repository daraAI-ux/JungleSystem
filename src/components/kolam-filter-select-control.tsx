import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamSelectTrigger} from './kolam-select-trigger';
import type {KolamFilterBarControl} from './kolam-filter-bar-types';

export function KolamFilterSelectControl({
  control,
  value = '',
  onChange,
}: {
  control: KolamFilterBarControl;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const options = control.options ?? [];
  const selectedOption =
    options.find(option => option.id === value) ?? options[0];
  const selectedIndex = Math.max(
    0,
    options.findIndex(option => option.id === selectedOption?.id),
  );
  const nextOption = options[(selectedIndex + 1) % Math.max(1, options.length)];

  return (
    <KolamInteractionFrame
      accessibilityLabel={control.label}
      onPress={() => {
        if (nextOption) {
          onChange?.(nextOption.id);
        }
      }}>
      <KolamSelectTrigger
        accessibilityLabel={control.label}
        value={selectedOption?.label ?? control.label}
        wide={control.triggerWidth === 'min-w-40'}
      />
    </KolamInteractionFrame>
  );
}
