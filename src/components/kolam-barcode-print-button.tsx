import React from 'react';
import {StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_BARCODE_BUTTON_ICON_SVG} from '../assets/icons/barcode-button-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamButton, type KolamButtonProps} from './kolam-button';

export interface KolamBarcodePrintButtonProps
  extends Omit<KolamButtonProps, 'icon' | 'label' | 'textStyle'> {
  label?: string;
}

const KOLAM_BARCODE_PRINT_BUTTON_LABEL = 'Cetak barcode';
const KOLAM_BARCODE_PRINT_BUTTON_ICON_XML = KOLAM_BARCODE_BUTTON_ICON_SVG
  .replace(/#000000/g, V.colors.primaryFg)
  .replace(/#ffffff/g, V.colors.primaryFg);

export function KolamBarcodePrintButton({
  accessibilityLabel,
  label = KOLAM_BARCODE_PRINT_BUTTON_LABEL,
  style,
  ...buttonProps
}: KolamBarcodePrintButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? label}
      icon={
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_BARCODE_PRINT_BUTTON_ICON_XML}
        />
      }
      label={label}
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
