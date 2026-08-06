import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_KATAK_SPECIES_ICON_SVG} from '../assets/icons/katak-species-icon-svg';

export interface KolamKatakSpeciesIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamKatakSpeciesIcon({
  accessibilityLabel = 'Icon species',
  style,
}: KolamKatakSpeciesIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_KATAK_SPECIES_ICON_SVG} />
    </View>
  );
}
