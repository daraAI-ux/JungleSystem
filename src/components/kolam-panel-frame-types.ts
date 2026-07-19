import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export type KolamPanelFrameVariant =
  | 'auth'
  | 'attention'
  | 'commandPalette'
  | 'detail'
  | 'module'
  | 'status'
  | 'surface'
  | 'userMenu';

export interface KolamPanelFrameProps {
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant: KolamPanelFrameVariant;
}