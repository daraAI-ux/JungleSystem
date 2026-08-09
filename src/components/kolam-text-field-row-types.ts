import type { TextInputProps } from 'react-native';
import type { ReactNode } from 'react';
import type { KolamRowFrameVariant } from './kolam-row-frame-types';

export interface KolamTextFieldRowProps {
  description: string;
  fieldWidth?: number;
  label: string;
  multiline?: boolean;
  numberOfLines?: number;
  onChangeText: TextInputProps['onChangeText'];
  placeholder?: string;
  renderInput?: () => ReactNode;
  variant?: KolamRowFrameVariant;
  value: string;
}
