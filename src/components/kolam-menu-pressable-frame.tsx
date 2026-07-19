import React from 'react';
import { getMenuPressableFrameStyle } from './kolam-menu-pressable-frame-style';
import { menuPressableFrameStyles as styles } from './kolam-menu-pressable-frame-styles';
import type { KolamMenuPressableFrameProps } from './kolam-menu-pressable-frame-types';
import { KolamPressable } from './kolam-pressable';

export type {
  KolamMenuPressableFrameProps,
  KolamMenuPressableFrameVariant,
} from './kolam-menu-pressable-frame-types';

export function KolamMenuPressableFrame({
  active = false,
  children,
  onPress,
  style,
  variant = 'item',
}: KolamMenuPressableFrameProps) {
  return (
    <KolamPressable
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({
        hovered,
        pressed,
      }: {
        hovered?: boolean;
        pressed?: boolean;
      }) => [
        getMenuPressableFrameStyle(variant),
        active && styles.itemActive,
        (hovered || pressed) && !active && styles.itemHover,
        style,
      ]}
    >
      {children}
    </KolamPressable>
  );
}
