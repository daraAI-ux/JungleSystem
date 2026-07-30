import React from 'react';
import {StyleSheet, type StyleProp, type TextStyle, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamChevronIcon} from './kolam-chevron-icon';

export type KolamTableFilterTriggerVariant = 'success' | 'quiet';

export function KolamTableFilterTrigger({
  active,
  label,
  onPress,
  style,
  textStyle,
  variant = 'success',
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** `quiet` = outline/neutral toolbar chrome (elegant). Default keeps Species green. */
  variant?: KolamTableFilterTriggerVariant;
}) {
  const quiet = variant === 'quiet';
  const chevronColor = quiet
    ? active
      ? V.colors.primary
      : V.colors.mutedFg
    : active
      ? V.colors.primaryFg
      : V.colors.success;

  return (
    <KolamButton
      icon={
        <KolamChevronIcon
          color={chevronColor}
          direction="down"
          size="menu-sm"
        />
      }
      intent={quiet ? (active ? 'outline' : 'plain') : active ? 'primary' : 'secondary'}
      label={label}
      onPress={onPress}
      style={[
        quiet ? styles.quietTrigger : styles.trigger,
        quiet && active ? styles.quietTriggerActive : null,
        !quiet && active ? styles.triggerActive : null,
        style,
      ]}
      textStyle={[
        quiet ? styles.quietTriggerText : styles.triggerText,
        quiet && active ? styles.quietTriggerTextActive : null,
        !quiet && active ? styles.triggerTextActive : null,
        textStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
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
  quietTrigger: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  quietTriggerActive: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  quietTriggerText: {
    color: V.colors.fg,
    fontWeight: '600',
  },
  quietTriggerTextActive: {
    color: V.colors.primary,
    fontWeight: '700',
  },
});
