import React from 'react';
import type {
  AccessibilityRole,
  AccessibilityState,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  KolamPressable,
  type KolamPressableProps,
} from './kolam-pressable';

export interface KolamInteractionFrameProps {
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  checked?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  onPress?: KolamPressableProps['onPress'];
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function KolamInteractionFrame({
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  checked,
  children,
  disabled = false,
  onPress,
  selected,
  style,
}: KolamInteractionFrameProps) {
  return (
    <KolamPressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityState={
        accessibilityState ??
        getKolamInteractionAccessibilityState({
          checked,
          disabled,
          selected,
        })
      }
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={style}>
      {children}
    </KolamPressable>
  );
}

function getKolamInteractionAccessibilityState({
  checked,
  disabled,
  selected,
}: Pick<
  KolamInteractionFrameProps,
  'checked' | 'disabled' | 'selected'
>): AccessibilityState | undefined {
  const state: AccessibilityState = {};

  if (typeof checked === 'boolean') {
    state.checked = checked;
  }

  if (typeof disabled === 'boolean') {
    state.disabled = disabled;
  }

  if (typeof selected === 'boolean') {
    state.selected = selected;
  }

  return Object.keys(state).length ? state : undefined;
}

