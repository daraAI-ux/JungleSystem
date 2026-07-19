import type React from 'react';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type {KolamBadgeIntent} from '../domain/kolam-badge';

export type KolamStatusBadgeIntent = KolamBadgeIntent | 'muted';

export interface KolamStatusBadgeProps {
  label: string | number;
  intent?: KolamStatusBadgeIntent;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
}
