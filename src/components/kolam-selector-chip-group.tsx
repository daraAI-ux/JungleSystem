import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSelectorChip} from './kolam-selector-chip';

export interface KolamSelectorChipOption {
  id: string;
  label: string;
}

export interface KolamSelectorChipGroupProps {
  limit?: number;
  onSelect: (optionId: string) => void;
  options: KolamSelectorChipOption[];
  selectedId: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamSelectorChipGroup({
  limit,
  onSelect,
  options,
  selectedId,
  style,
}: KolamSelectorChipGroupProps) {
  return (
    <View style={[styles.selectorBlock, style]}>
      <KolamMappedList
        items={options}
        limit={limit}
        getKey={option => option.id}
        renderItem={option => (
          <KolamSelectorChip
            label={option.label}
            active={option.id === selectedId}
            onPress={() => onSelect(option.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selectorBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
});
