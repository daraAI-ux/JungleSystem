import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_KANDANG_ENCLOSURE_ICON_SVG} from '../assets/icons/kandang-enclosure-icon-svg';

export interface KolamKandangEnclosureIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamKandangEnclosureIcon({
  accessibilityLabel = 'Icon kandang',
  style,
}: KolamKandangEnclosureIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_KANDANG_ENCLOSURE_ICON_SVG} />
    </View>
  );
}
