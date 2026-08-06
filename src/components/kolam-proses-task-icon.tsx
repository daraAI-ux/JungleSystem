import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_PROSES_TASK_ICON_SVG} from '../assets/icons/proses-task-icon-svg';

export interface KolamProsesTaskIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamProsesTaskIcon({
  accessibilityLabel = 'Icon sedang berjalan',
  style,
}: KolamProsesTaskIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_PROSES_TASK_ICON_SVG} />
    </View>
  );
}
