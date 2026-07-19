import type {TextInputProps} from 'react-native';

export interface KolamTextFieldRowProps {
  description: string;
  fieldWidth?: number;
  label: string;
  onChangeText: TextInputProps['onChangeText'];
  placeholder?: string;
  value: string;
}
