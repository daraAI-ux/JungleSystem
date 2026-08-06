import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_GAGAL_UNALLOCATED_ICON_SVG} from '../assets/icons/gagal-unallocated-icon-svg';

export interface KolamGagalUnallocatedIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamGagalUnallocatedIcon({
  accessibilityLabel = 'Icon belum di kandang',
  style,
}: KolamGagalUnallocatedIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_GAGAL_UNALLOCATED_ICON_SVG} />
    </View>
  );
}
