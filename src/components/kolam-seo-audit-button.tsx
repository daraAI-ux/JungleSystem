import React from 'react';
import {StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_SEO_BUTTON_ICON_SVG} from '../assets/icons/seo-button-icon-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {type KolamButtonProps, KolamButton} from './kolam-button';

export interface KolamSeoAuditButtonProps
  extends Omit<KolamButtonProps, 'icon' | 'label' | 'textStyle'> {
  label?: string;
}

const KOLAM_SEO_AUDIT_BUTTON_LABEL = 'SEO audit';
const KOLAM_SEO_AUDIT_BUTTON_ICON_XML = KOLAM_SEO_BUTTON_ICON_SVG
  .replace(/#000000/g, V.colors.primaryFg)
  .replace(/#ffffff/g, V.colors.primaryFg);
const KOLAM_ACTION_BUTTON_BG = '#374151';

export function KolamSeoAuditButton({
  accessibilityLabel,
  label = KOLAM_SEO_AUDIT_BUTTON_LABEL,
  style,
  ...buttonProps
}: KolamSeoAuditButtonProps) {
  return (
    <KolamButton
      {...buttonProps}
      accessibilityLabel={accessibilityLabel ?? label}
      icon={
        <SvgXml
          height="100%"
          width="100%"
          xml={KOLAM_SEO_AUDIT_BUTTON_ICON_XML}
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
