import React from 'react';
import {View, type StyleProp, type ViewStyle} from 'react-native';
import {KolamChoiceSegment} from './kolam-choice-segment';
import {KolamMappedList} from './kolam-mapped-list';
import type {KolamSegmentProps} from './kolam-segment';

export interface KolamChoiceSegmentOption<OptionId extends string = string> {
  id: OptionId;
  label: string;
}

export interface KolamChoiceSegmentGroupProps<OptionId extends string = string> {
  options: KolamChoiceSegmentOption<OptionId>[];
  onSelect: (optionId: OptionId) => void;
  selectedId: OptionId;
  style?: StyleProp<ViewStyle>;
  variant?: KolamSegmentProps['variant'];
}

export function KolamChoiceSegmentGroup<OptionId extends string = string>({
  options,
  onSelect,
  selectedId,
  style,
  variant,
}: KolamChoiceSegmentGroupProps<OptionId>) {
  return (
    <View style={style}>
      <KolamMappedList
        items={options}
        getKey={option => option.id}
        renderItem={option => (
          <KolamChoiceSegment
            id={option.id}
            label={option.label}
            onSelect={onSelect}
            selectedId={selectedId}
            variant={variant}
          />
        )}
      />
    </View>
  );
}
