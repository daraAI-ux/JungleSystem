import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

export interface KolamSearchFieldProps {
  value: string;
  onChangeText?: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  trailingLabel?: string;
}
