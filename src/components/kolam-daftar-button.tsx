import React from 'react';
import {StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_DAFTAR_BUTTON_ICON_SVG} from '../assets/icons/daftar-button-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {type KolamButtonProps, KolamButton} from './kolam-button';

type KolamDaftarButtonProps = Omit<
  KolamButtonProps,
  'icon' | 'label' | 'textStyle'
>;

const KOLAM_DAFTAR_BUTTON_LABEL = 'Daftar';
const KOLAM_DAFTAR_BUTTON_ICON_XML = KOLAM_DAFTAR_BUTTON_ICON_SVG.replace(
  /#000000/g,
  V.colors.primaryFg,
);
const KOLAM_ACTION_BUTTON_BG = '#374151';

export function KolamDaftarButton({
  accessibilityLabel,
  style,
  ...buttonProps
}: KolamDaftarButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? KOLAM_DAFTAR_BUTTON_LABEL}
      icon={
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_DAFTAR_BUTTON_ICON_XML}
        />
      }
      label={KOLAM_DAFTAR_BUTTON_LABEL}
      style={[styles.button, style]}
      textStyle={styles.text}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: KOLAM_ACTION_BUTTON_BG,
    borderColor: KOLAM_ACTION_BUTTON_BG,
  },
  text: {
    color: V.colors.primaryFg,
  },
});
