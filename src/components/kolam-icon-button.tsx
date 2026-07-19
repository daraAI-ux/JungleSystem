import React from 'react';
import {
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamInteractionFrame} from './kolam-interaction-frame';

export interface KolamIconButtonProps {
  accessibilityLabel?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  size?: 22 | 28 | 30 | 32;
  radius?: 'sm' | 'md' | 'lg' | 'full';
  variant?: 'framed' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

export function KolamIconButton({
  accessibilityLabel,
  children,
  onPress,
  size = 28,
  radius = 'lg',
  variant = 'framed',
  style,
}: KolamIconButtonProps) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[
        styles.button,
        getSizeStyle(size),
        getRadiusStyle(radius, size),
        variant === 'ghost' ? styles.ghost : styles.framed,
        style,
      ]}>
      {children}
    </KolamInteractionFrame>
  );
}

function getSizeStyle(size: NonNullable<KolamIconButtonProps['size']>) {
  switch (size) {
    case 22:
      return styles.size22;
    case 30:
      return styles.size30;
    case 32:
      return styles.size32;
    case 28:
    default:
      return styles.size28;
  }
}

function getRadiusStyle(
  radius: NonNullable<KolamIconButtonProps['radius']>,
  size: NonNullable<KolamIconButtonProps['size']>,
) {
  switch (radius) {
    case 'sm':
      return styles.radiusSm;
    case 'md':
      return styles.radiusMd;
    case 'full':
      return size === 22
        ? styles.radiusFull22
        : size === 30
          ? styles.radiusFull30
          : size === 32
            ? styles.radiusFull32
            : styles.radiusFull28;
    case 'lg':
    default:
      return styles.radiusLg;
  }
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  size22: {
    width: 22,
    height: 22,
  },
  size28: {
    width: 28,
    height: 28,
  },
  size30: {
    width: 30,
    height: 30,
  },
  size32: {
    width: 32,
    height: 32,
  },
  radiusSm: {
    borderRadius: V.radius.sm,
  },
  radiusMd: {
    borderRadius: V.radius.md,
  },
  radiusLg: {
    borderRadius: V.radius.lg,
  },
  radiusFull22: {
    borderRadius: 11,
  },
  radiusFull28: {
    borderRadius: 14,
  },
  radiusFull30: {
    borderRadius: 15,
  },
  radiusFull32: {
    borderRadius: 16,
  },
  framed: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
});
