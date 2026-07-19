import type {
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface KolamSelectableRowProps {
  children?: React.ReactNode;
  description: string;
  selected?: boolean;
  title: string;
  accessibilityLabel?: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}
