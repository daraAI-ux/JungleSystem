import React from 'react';
import {StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_DETAIL_BUTTON_ICON_SVG} from '../assets/icons/detail-button-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {type KolamButtonProps, KolamButton} from './kolam-button';

type KolamDetailButtonProps = Omit<
  KolamButtonProps,
  'icon' | 'label' | 'textStyle'
> & {
  label?: string;
};

export const KOLAM_DETAIL_BUTTON_LABEL = 'Detail';
export const KOLAM_DETAIL_BUTTON_ICON_XML = KOLAM_DETAIL_BUTTON_ICON_SVG.replace(
  /#000000/g,
  V.colors.primaryFg,
);
export const KOLAM_ACTION_BUTTON_BG = '#374151';

export function KolamDetailButton({
  accessibilityLabel,
  label = KOLAM_DETAIL_BUTTON_LABEL,
  style,
  ...buttonProps
}: KolamDetailButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? label}
      icon={
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_DETAIL_BUTTON_ICON_XML}
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
    backgroundColor: KOLAM_ACTION_BUTTON_BG,
    borderColor: KOLAM_ACTION_BUTTON_BG,
  },
  text: {
    color: V.colors.primaryFg,
  },
});
