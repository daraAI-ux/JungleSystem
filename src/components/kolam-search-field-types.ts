import type {
  StyleProp,
  TextInput,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type {Ref} from 'react';

export interface KolamSearchFieldProps {
  value: string;
  accessibilityLabel?: string;
  onChangeText?: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  inputRef?: Ref<TextInput>;
  inputStyle?: StyleProp<TextStyle>;
  trailingLabel?: string;
}
