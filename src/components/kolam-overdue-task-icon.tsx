import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_OVERDUE_TASK_ICON_SVG} from '../assets/icons/overdue-task-icon-svg';

export interface KolamOverdueTaskIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamOverdueTaskIcon({
  accessibilityLabel = 'Icon overdue',
  style,
}: KolamOverdueTaskIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_OVERDUE_TASK_ICON_SVG} />
    </View>
  );
}
