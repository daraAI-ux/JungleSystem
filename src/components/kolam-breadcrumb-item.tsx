import React from 'react';
import { StyleSheet } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamInteractionFrame } from './kolam-interaction-frame';

export interface KolamBreadcrumbItemProps {
  current?: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
}

export function KolamBreadcrumbItem({
  current = false,
  disabled = false,
  label,
  onPress,
}: KolamBreadcrumbItemProps) {
  return (
    <KolamInteractionFrame
      accessibilityState={{ disabled, selected: current }}
      disabled={disabled}
      onPress={onPress}
      style={styles.item}
    >
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            style: [
              styles.text,
              current && styles.textCurrent,
              disabled && styles.textDisabled,
            ],
          },
        ]}
      />
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 28,
    justifyContent: 'center',
  },
  text: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  textCurrent: {
    color: V.colors.navbarFg,
  },
  textDisabled: {
    color: V.colors.mutedFg,
    opacity: 0.7,
  },
});
