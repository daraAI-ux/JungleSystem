import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {KOLAM_TODO_TASK_ICON_SVG} from '../assets/icons/todo-task-icon-svg';

export interface KolamTodoTaskIconProps {
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamTodoTaskIcon({
  accessibilityLabel = 'Icon todo',
  style,
}: KolamTodoTaskIconProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style}>
      <SvgXml height="100%" width="100%" xml={KOLAM_TODO_TASK_ICON_SVG} />
    </View>
  );
}
