import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_STOK_TOTAL_ICON_SVG} from '../assets/icons/stok-total-icon-svg';

export interface KolamStokTotalIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamStokTotalIcon({
  accessibilityLabel = 'Icon stok total',
  style,
}: KolamStokTotalIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_STOK_TOTAL_ICON_SVG} />
    </View>
  );
}
