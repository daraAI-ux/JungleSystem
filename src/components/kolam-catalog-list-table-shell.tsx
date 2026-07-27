import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamContentFrame} from './kolam-content-frame';
import type {KolamContentFrameVariant} from './kolam-content-frame-types';

/**
 * Shared catalog list chrome: table body + pagination footer in one frame.
 * Footer stays flush to the bottom edge of the table unit (edit once → all lists).
 */
export function KolamCatalogListTableShell({
  children,
  footer,
  style,
  variant = 'settingsWebConfig',
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: KolamContentFrameVariant;
}) {
  return (
    <KolamContentFrame style={[styles.shell, style]} variant={variant}>
      <View style={styles.body}>{children}</View>
      <View style={styles.footer}>{footer}</View>
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  footer: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
