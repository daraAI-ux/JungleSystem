import React from 'react';
import {StyleSheet, type StyleProp, type TextStyle, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamChevronIcon} from './kolam-chevron-icon';

export function KolamTableFilterTrigger({
  active,
  label,
  onPress,
  style,
  textStyle,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <KolamButton
      icon={
        <KolamChevronIcon
          color={active ? V.colors.primaryFg : V.colors.success}
          direction="down"
          size="menu-sm"
        />
      }
      intent={active ? 'primary' : 'secondary'}
      label={label}
      onPress={onPress}
      style={[styles.trigger, active && styles.triggerActive, style]}
      textStyle={[
        styles.triggerText,
        active && styles.triggerTextActive,
        textStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
    flexBasis: 0,
    flexGrow: 1,
    minHeight: 34,
    minWidth: 120,
    paddingHorizontal: 8,
  },
  triggerActive: {
    backgroundColor: V.colors.success,
    borderColor: V.colors.success,
  },
  triggerText: {
    color: V.colors.success,
    fontWeight: '800',
  },
  triggerTextActive: {
    color: V.colors.primaryFg,
  },
});
