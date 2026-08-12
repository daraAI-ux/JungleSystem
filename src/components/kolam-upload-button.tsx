import React from 'react';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  type KolamActionControlButtonProps,
  KolamActionControlButton,
} from './kolam-action-control-button';
import {KolamUploadArrowIcon} from './kolam-upload-arrow-icon';

type KolamUploadButtonProps = Omit<
  KolamActionControlButtonProps,
  'icon' | 'label'
> & {
  label?: string;
};

const KOLAM_UPLOAD_BUTTON_LABEL = 'Unggah';
const KOLAM_UPLOAD_BUTTON_CHARCOAL = '#374151';

export function KolamUploadButton({
  accessibilityLabel,
  label = KOLAM_UPLOAD_BUTTON_LABEL,
  style,
  textStyle,
  ...buttonProps
}: KolamUploadButtonProps) {
  return (
    <KolamActionControlButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? label}
      icon={<KolamUploadArrowIcon color={V.colors.primaryFg} size={16} />}
      label={label}
      style={[style, styles.button]}
      textStyle={[textStyle, styles.text]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: KOLAM_UPLOAD_BUTTON_CHARCOAL,
    borderColor: KOLAM_UPLOAD_BUTTON_CHARCOAL,
  },
  text: {
    color: V.colors.primaryFg,
  },
});
