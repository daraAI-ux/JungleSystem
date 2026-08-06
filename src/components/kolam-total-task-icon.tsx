import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_TOTAL_TASK_ICON_SVG} from '../assets/icons/total-task-icon-svg';

export interface KolamTotalTaskIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamTotalTaskIcon({
  accessibilityLabel = 'Icon total task',
  style,
}: KolamTotalTaskIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_TOTAL_TASK_ICON_SVG} />
    </View>
  );
}
