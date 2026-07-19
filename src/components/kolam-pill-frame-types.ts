import type {ReactNode} from 'react';
import type {
  AccessibilityState,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type KolamPillFrameVariant = 'state' | 'selector';

export interface KolamPillFrameProps {
  children: ReactNode;
  disabled?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: KolamPillFrameVariant;
}

export interface KolamInteractivePillFrameProps extends KolamPillFrameProps {
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  onPress?: (event: GestureResponderEvent) => void;
}
