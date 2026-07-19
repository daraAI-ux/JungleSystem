import React from 'react';
import {
  StyleSheet,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamActionFrame} from './kolam-action-frame';

export interface KolamTableActionButtonProps {
  accessibilityLabel: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export function KolamTableActionButton({
  accessibilityLabel,
  onPress,
  style,
}: KolamTableActionButtonProps) {
  return (
    <KolamActionFrame
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={style}
      variant="table">
      <KolamTableEyeIcon />
    </KolamActionFrame>
  );
}

interface KolamTableEyeIconProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function KolamTableEyeIcon({
  color = V.colors.mutedFg,
  style,
}: KolamTableEyeIconProps) {
  return (
    <View style={[styles.eyeIcon, style]}>
      <View style={[styles.eyeRing, {borderColor: color}]} />
      <View style={[styles.eyeDot, {backgroundColor: color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  eyeIcon: {
    width: 19,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeRing: {
    width: 17,
    height: 11,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  eyeDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
