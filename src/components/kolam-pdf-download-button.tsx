import React from 'react';
import { StyleSheet, type TextStyle } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton, type KolamButtonProps } from './kolam-button';
import { KolamPdfFileIcon } from './kolam-pdf-file-icon';

export interface KolamPdfDownloadButtonProps
  extends Omit<KolamButtonProps, 'icon' | 'label'> {
  iconOnly?: boolean;
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
}

export function KolamPdfDownloadButton({
  accessibilityLabel,
  iconOnly = false,
  label = 'Unduh PDF',
  loading = false,
  loadingLabel,
  size = 'sm',
  style,
  textStyle,
  ...buttonProps
}: KolamPdfDownloadButtonProps) {
  const resolvedLabel = loading && loadingLabel ? loadingLabel : label;
  const resolvedAccessibilityLabel =
    accessibilityLabel ?? (iconOnly ? label : resolvedLabel);

  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={resolvedAccessibilityLabel}
      icon={<KolamPdfFileIcon size={size === 'md' ? 18 : 16} />}
      label={iconOnly ? '' : resolvedLabel}
      size={size}
      style={[iconOnly ? styles.iconOnlyButton : null, style]}
      textStyle={[iconOnly ? styles.iconOnlyText : null, textStyle]}
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
