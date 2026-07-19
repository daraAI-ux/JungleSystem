import type React from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type KolamSelectableCardLayout = 'half' | 'third';

export interface KolamSelectableCardProps {
  children: React.ReactNode;
  layout?: KolamSelectableCardLayout;
  minHeight?: number;
  blocked?: boolean;
  accessibilityLabel?: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}
