import React from 'react';
import {StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_COMPLAINT_MODULE_ICON_SVG} from '../assets/icons/complaint-module-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {type KolamButtonProps, KolamButton} from './kolam-button';

type KolamComplaintButtonProps = Omit<
  KolamButtonProps,
  'icon' | 'label' | 'textStyle'
> & {
  label?: string;
};

const KOLAM_COMPLAINT_BUTTON_LABEL = 'Ajukan komplain';
const KOLAM_COMPLAINT_BUTTON_ICON_XML = KOLAM_COMPLAINT_MODULE_ICON_SVG.replace(
  /#000000/g,
  V.colors.primaryFg,
);
const KOLAM_ACTION_BUTTON_BG = '#374151';

export function KolamComplaintButton({
  accessibilityLabel,
  label = KOLAM_COMPLAINT_BUTTON_LABEL,
  style,
  ...buttonProps
}: KolamComplaintButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? label}
      icon={
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_COMPLAINT_BUTTON_ICON_XML}
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
