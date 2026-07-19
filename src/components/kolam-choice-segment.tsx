import React from 'react';
import {
  KolamSegment,
  type KolamSegmentProps,
} from './kolam-segment';

export interface KolamChoiceSegmentProps<OptionId extends string = string> {
  id: OptionId;
  label: string;
  onSelect: (optionId: OptionId) => void;
  selectedId: OptionId;
  variant?: KolamSegmentProps['variant'];
}

export function KolamChoiceSegment<OptionId extends string = string>({
  id,
  label,
  onSelect,
  selectedId,
  variant,
}: KolamChoiceSegmentProps<OptionId>) {
  return (
    <KolamSegment
      label={label}
      active={selectedId === id}
      onPress={() => onSelect(id)}
      variant={variant}
    />
  );
}
