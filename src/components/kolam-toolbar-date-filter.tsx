import React from 'react';
import {StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {KolamDateField} from './kolam-date-field';

export function KolamToolbarDateFilter({
  accessibilityLabel,
  label,
  onChange,
  placeholder,
  style,
  value,
}: {
  accessibilityLabel?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  value: string;
}) {
  return (
    <KolamDateField
      accessibilityLabel={accessibilityLabel ?? label}
      label={label}
      onChange={onChange}
      panelVariant="dropdown"
      placeholder={placeholder ?? label}
      showLabelInTrigger={false}
      style={[styles.root, style]}
      triggerStyle={styles.trigger}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    minWidth: 132,
    width: 148,
  },
  trigger: {
    borderRadius: 8,
    minWidth: 132,
    paddingHorizontal: 10,
  },
});
