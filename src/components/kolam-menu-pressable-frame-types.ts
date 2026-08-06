import type { ReactNode } from 'react';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

export type KolamMenuPressableFrameVariant =
  | 'item'
  | 'groupedItem'
  | 'groupToggle'
  | 'sectionToggle';

export interface KolamMenuPressableFrameProps {
  active?: boolean;
  children: ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  variant?: KolamMenuPressableFrameVariant;
}
