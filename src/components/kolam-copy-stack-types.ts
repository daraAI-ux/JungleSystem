import type {ReactNode} from 'react';
import type {StyleProp, TextProps, TextStyle, ViewStyle} from 'react-native';

export interface KolamCopyStackItem {
  id?: string;
  style?: StyleProp<TextStyle>;
  text: ReactNode;
  textProps?: TextProps;
}

export interface KolamCopyStackProps {
  containerStyle?: StyleProp<ViewStyle>;
  items: KolamCopyStackItem[];
}
