import React from 'react';
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';

export interface KolamCategoryLabelProps {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function KolamCategoryLabel({
  label,
  onPress,
  style,
  textStyle,
}: KolamCategoryLabelProps) {
  return (
    <KolamButton
      intent="outline"
      label={label}
      onPress={onPress}
      style={[styles.button, style]}
      textStyle={[styles.text, textStyle]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: V.colors.infoSoft,
    borderColor: V.colors.info,
    minHeight: 32,
  },
  text: {
    color: V.colors.info,
  },
});
