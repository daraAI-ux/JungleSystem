import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export type KolamShellFrameVariant =
  | 'appShell'
  | 'appMain'
  | 'commandPaletteOverlay'
  | 'dashboardLayout'
  | 'dashboardMain'
  | 'topNavigation';

export interface KolamShellFrameProps {
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant: KolamShellFrameVariant;
}