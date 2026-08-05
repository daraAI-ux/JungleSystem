import React from 'react';
import {StyleSheet, type TextStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton, type KolamButtonProps} from './kolam-button';
import {KolamResetIcon} from './kolam-reset-icon';

export interface KolamResetButtonProps
  extends Omit<KolamButtonProps, 'icon' | 'label'> {
  label?: string;
}

export function KolamResetButton({
  accessibilityLabel,
  label = 'Reset',
  size = 'sm',
  style,
  textStyle,
  ...buttonProps
}: KolamResetButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? label}
      icon={<KolamResetIcon size={size === 'md' ? 20 : 18} />}
      label=""
      size={size}
      style={[styles.iconOnlyButton, style]}
      textStyle={[styles.iconOnlyText, textStyle]}
    />
  );
}

const styles = StyleSheet.create({
  iconOnlyButton: {
    minWidth: 34,
    paddingHorizontal: 0,
    width: 34,
  },
  iconOnlyText: {
    color: V.colors.bg,
    display: 'none',
    fontSize: 0,
    lineHeight: 0,
  } as TextStyle,
});
