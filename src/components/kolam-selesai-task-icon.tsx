import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_SELESAI_TASK_ICON_SVG} from '../assets/icons/selesai-task-icon-svg';

export interface KolamSelesaiTaskIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamSelesaiTaskIcon({
  accessibilityLabel = 'Icon selesai',
  style,
}: KolamSelesaiTaskIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_SELESAI_TASK_ICON_SVG} />
    </View>
  );
}
