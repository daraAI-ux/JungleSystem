import type {ReactNode} from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type KolamActionFrameVariant = 'text' | 'table';

export interface KolamActionFrameProps {
  accessibilityLabel: string;
  children: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  variant?: KolamActionFrameVariant;
}
