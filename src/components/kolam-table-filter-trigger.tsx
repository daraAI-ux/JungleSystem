import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton} from './kolam-button';
import {KolamChevronIcon} from './kolam-chevron-icon';
import {KolamInteractionFrame} from './kolam-interaction-frame';

export type KolamTableFilterTriggerVariant = 'success' | 'quiet';

export function KolamTableFilterTrigger({
  active,
  label,
  onPress,
  open = false,
  style,
  textStyle,
  variant = 'success',
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  /** When true, quiet caret points up (panel open). */
  open?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** `quiet` = custom select-like chrome. Default keeps Species green button. */
  variant?: KolamTableFilterTriggerVariant;
}) {
  if (variant === 'quiet') {
    return (
      <KolamInteractionFrame
        accessibilityLabel={label}
        accessibilityState={{expanded: open}}
        onPress={onPress}
        style={[
          styles.quietRoot,
          active ? styles.quietRootActive : null,
          open ? styles.quietRootOpen : null,
          style,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.quietLabel,
            active || open ? styles.quietLabelActive : null,
            textStyle,
          ]}
        >
          {label}
        </Text>
        <View style={styles.quietDivider} />
        <View style={styles.caretSlot}>
          <QuietCaret
            color={active || open ? V.colors.primary : V.colors.mutedFg}
            open={open}
          />
        </View>
      </KolamInteractionFrame>
    );
  }

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

/** Solid ∨ caret — border-triangle tricks often render blank on RNW. */
function QuietCaret({color, open}: {color: string; open: boolean}) {
  return (
    <View style={[styles.caretWrap, open ? styles.caretWrapOpen : null]}>
      <View style={[styles.caretArm, styles.caretArmLeft, {backgroundColor: color}]} />
      <View style={[styles.caretArm, styles.caretArmRight, {backgroundColor: color}]} />
    </View>
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
  quietRoot: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 0,
    gap: 0,
    maxWidth: 240,
    minHeight: 34,
    overflow: 'hidden',
    paddingLeft: 12,
  },
  quietRootActive: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
  },
  quietRootOpen: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.primary,
  },
  quietLabel: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    paddingRight: 10,
  },
  quietLabelActive: {
    color: V.colors.primary,
    fontWeight: '700',
  },
  quietDivider: {
    alignSelf: 'stretch',
    backgroundColor: V.colors.border,
    width: StyleSheet.hairlineWidth,
  },
  caretSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  caretWrap: {
    alignItems: 'center',
    height: 12,
    justifyContent: 'center',
    position: 'relative',
    width: 12,
  },
  caretWrapOpen: {
    transform: [{rotate: '180deg'}],
  },
  caretArm: {
    borderRadius: 1,
    height: 2,
    position: 'absolute',
    top: 4,
    width: 7,
  },
  caretArmLeft: {
    left: 0,
    transform: [{rotate: '40deg'}],
  },
  caretArmRight: {
    right: 0,
    transform: [{rotate: '-40deg'}],
  },
});
