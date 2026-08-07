import React from 'react';
import {SvgXml} from 'react-native-svg';
import {KOLAM_SAVE_BUTTON_ICON_SVG} from '../assets/icons/save-button-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {type KolamButtonProps, KolamButton} from './kolam-button';

type KolamSaveButtonProps = Omit<KolamButtonProps, 'icon' | 'label'> & {
  label?: string;
};

const KOLAM_SAVE_BUTTON_LABEL = 'Simpan';
const KOLAM_SAVE_BUTTON_ICON_XML = KOLAM_SAVE_BUTTON_ICON_SVG.replace(
  /#000000/g,
  V.colors.success,
);

export function KolamSaveButton({
  accessibilityLabel,
  label = KOLAM_SAVE_BUTTON_LABEL,
  tone = 'positive',
  ...buttonProps
}: KolamSaveButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? label}
      icon={
        <SvgXml height="100%" width="100%" xml={KOLAM_SAVE_BUTTON_ICON_XML} />
      }
      label={label}
      tone={tone}
    />
  );
}
