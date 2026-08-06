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
 *
 * Use `fill` when the body hosts a FlatList on an owned-scroll list page
 * (`isCatalogTableListRoute`) so the list gets a bounded height instead of collapsing.
 */
export function KolamCatalogListTableShell({
  children,
  fill = false,
  footer,
  onBodyWidthChange,
  showFooter = true,
  style,
  variant = 'settingsWebConfig',
}: {
  children: React.ReactNode;
  /** Stretch shell/body to parent so nested FlatList can scroll. */
  fill?: boolean;
  footer: React.ReactNode;
  onBodyWidthChange?: (width: number) => void;
  showFooter?: boolean;
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
    <KolamContentFrame
      style={[styles.shell, fill ? styles.shellFill : null, style]}
      variant={variant}
    >
      <View
        onLayout={handleBodyLayout}
        style={[styles.body, fill ? styles.bodyFill : null]}
      >
        {children}
      </View>
      {showFooter ? <View style={styles.footer}>{footer}</View> : null}
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
  shellFill: {
    flex: 1,
    flexGrow: 1,
    minHeight: 0,
  },
  body: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
    overflow: 'visible',
    width: '100%',
  },
  bodyFill: {
    flex: 1,
    flexGrow: 1,
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
