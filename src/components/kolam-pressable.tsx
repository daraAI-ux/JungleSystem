import React from 'react';
import {Pressable, type PressableProps} from 'react-native';

export type KolamPressableProps = PressableProps;

export function KolamPressable({
  accessibilityRole = 'button',
  ...props
}: KolamPressableProps) {
  return <Pressable accessibilityRole={accessibilityRole} {...props} />;
}
