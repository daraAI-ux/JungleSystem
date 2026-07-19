import type {ReactNode} from 'react';
import type {
  AccessibilityState,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type KolamRowFrameVariant =
  | 'dataTableHeader'
  | 'dataTable'
  | 'form'
  | 'endpoint'
  | 'surface'
  | 'selectable'
  | 'cart'
  | 'pluginRegistry'
  | 'sales'
  | 'settingsActivityHeader'
  | 'settingsActivity'
  | 'settingsPermission';

export interface KolamRowFrameProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: KolamRowFrameVariant;
}

export interface KolamInteractiveRowFrameProps extends KolamRowFrameProps {
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  onPress?: (event: GestureResponderEvent) => void;
  selected?: boolean;
}