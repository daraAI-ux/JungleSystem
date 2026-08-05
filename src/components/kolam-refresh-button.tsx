import React from 'react';
import {StyleSheet, type TextStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton, type KolamButtonProps} from './kolam-button';
import {KolamRefreshIcon} from './kolam-refresh-icon';

export interface KolamRefreshButtonProps
  extends Omit<KolamButtonProps, 'icon' | 'label'> {
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
}

export function KolamRefreshButton({
  accessibilityLabel,
  label = 'Refresh',
  loading = false,
  loadingLabel,
  muted,
  size = 'sm',
  style,
  textStyle,
  ...buttonProps
}: KolamRefreshButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={
        accessibilityLabel ?? (loading && loadingLabel ? loadingLabel : label)
      }
      icon={<KolamRefreshIcon size={size === 'md' ? 17 : 16} />}
      label=""
      muted={muted || loading}
      size={size}
      style={[styles.iconOnlyButton, style]}
      textStyle={[styles.iconOnlyText, textStyle]}
    />
  );
}

const styles = StyleSheet.create({
  iconOnlyButton: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
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
