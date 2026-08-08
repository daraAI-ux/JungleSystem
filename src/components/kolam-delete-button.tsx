import React from 'react';
import {StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_CANCEL_BUTTON_ICON_SVG} from '../assets/icons/cancel-button-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {type KolamButtonProps, KolamButton} from './kolam-button';

type KolamDeleteButtonProps = Omit<
  KolamButtonProps,
  'icon' | 'label' | 'textStyle'
> & {
  label?: string;
};

const KOLAM_DELETE_BUTTON_LABEL = 'Hapus';
const KOLAM_DELETE_BUTTON_ICON_XML = KOLAM_CANCEL_BUTTON_ICON_SVG.replace(
  /#ff3636/g,
  V.colors.danger,
);

export function KolamDeleteButton({
  accessibilityLabel,
  label = KOLAM_DELETE_BUTTON_LABEL,
  style,
  ...buttonProps
}: KolamDeleteButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? label}
      icon={
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_DELETE_BUTTON_ICON_XML}
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
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  text: {
    color: V.colors.danger,
  },
});
