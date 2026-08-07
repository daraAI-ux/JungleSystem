import React from 'react';
import {StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_EXEL_BUTTON_ICON_SVG} from '../assets/icons/exel-button-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton, type KolamButtonProps} from './kolam-button';

export interface KolamExportXlsButtonProps
  extends Omit<KolamButtonProps, 'icon' | 'label' | 'textStyle'> {
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
}

const KOLAM_EXPORT_XLS_BUTTON_LABEL = 'Export XLS';
const KOLAM_EXPORT_XLS_BUTTON_ICON_XML = KOLAM_EXEL_BUTTON_ICON_SVG
  .replace(/#000000/g, V.colors.primaryFg)
  .replace(/#ffffff/g, V.colors.primaryFg);

export function KolamExportXlsButton({
  accessibilityLabel,
  label = KOLAM_EXPORT_XLS_BUTTON_LABEL,
  loading = false,
  loadingLabel = 'Mengekspor...',
  style,
  ...buttonProps
}: KolamExportXlsButtonProps) {
  const resolvedLabel = loading ? loadingLabel : label;

  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? resolvedLabel}
      icon={
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_EXPORT_XLS_BUTTON_ICON_XML}
        />
      }
      label={resolvedLabel}
      style={[styles.button, style]}
      textStyle={styles.text}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: V.colors.fg,
    borderColor: V.colors.fg,
  },
  text: {
    color: V.colors.primaryFg,
  },
});
