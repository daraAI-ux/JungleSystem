import React from 'react';
import {StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_EDIT_BUTTON_ICON_SVG} from '../assets/icons/edit-button-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {type KolamButtonProps, KolamButton} from './kolam-button';

type KolamEditButtonProps = Omit<
  KolamButtonProps,
  'icon' | 'label' | 'textStyle'
>;

const KOLAM_EDIT_BUTTON_LABEL = 'Rubah';
const KOLAM_EDIT_BUTTON_ICON_XML = KOLAM_EDIT_BUTTON_ICON_SVG.replace(
  /#000000/g,
  V.colors.primaryFg,
);

export function KolamEditButton({
  accessibilityLabel,
  style,
  ...buttonProps
}: KolamEditButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? KOLAM_EDIT_BUTTON_LABEL}
      icon={
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_EDIT_BUTTON_ICON_XML}
        />
      }
      label={KOLAM_EDIT_BUTTON_LABEL}
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
