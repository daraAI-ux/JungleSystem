import React from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamContentFrame} from './kolam-content-frame';
import type {KolamContentFrameVariant} from './kolam-content-frame-types';

/**
 * Shared catalog list chrome: table body + pagination footer in one frame.
 * Footer hugs the last row (no flex-fill gap). Edit once → all lists update.
 *
 * `onBodyWidthChange` supports fit-to-width column layout (FE-like smart tables
 * without horizontal scroll): parent measures available width, then allocates columns.
 */
export function KolamCatalogListTableShell({
  children,
  footer,
  onBodyWidthChange,
  style,
  variant = 'settingsWebConfig',
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  onBodyWidthChange?: (width: number) => void;
  style?: StyleProp<ViewStyle>;
  variant?: KolamContentFrameVariant;
}) {
  const handleBodyLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const nextWidth = Math.round(event.nativeEvent.layout.width);
      if (nextWidth > 0) {
        onBodyWidthChange?.(nextWidth);
      }
    },
    [onBodyWidthChange],
  );

  return (
    <KolamContentFrame style={[styles.shell, style]} variant={variant}>
      <View onLayout={handleBodyLayout} style={styles.body}>
        {children}
      </View>
      <View style={styles.footer}>{footer}</View>
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  shell: {
    // Hug table + footer; do not stretch to viewport (avoids gap above footer).
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
    overflow: 'visible',
    width: '100%',
  },
  body: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
    overflow: 'visible',
    width: '100%',
  },
  footer: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
