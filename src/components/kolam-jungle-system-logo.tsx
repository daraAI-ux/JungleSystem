import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {JUNGLE_SYSTEM_LOGO_COLOR_SVG} from '../assets/brand/jungle-system-logo-color-svg';

export interface KolamJungleSystemLogoProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamJungleSystemLogo({
  accessibilityLabel = 'Logo JungleSystem',
  style,
}: KolamJungleSystemLogoProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={JUNGLE_SYSTEM_LOGO_COLOR_SVG} />
    </View>
  );
}
