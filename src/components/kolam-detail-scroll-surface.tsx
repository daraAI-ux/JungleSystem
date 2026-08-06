import React from 'react';
import {
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type KolamDetailScrollSurfaceProps = {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
} & Omit<ScrollViewProps, 'contentContainerStyle' | 'style'>;

export const KolamDetailScrollSurface = React.forwardRef<
  React.ElementRef<typeof ScrollView>,
  KolamDetailScrollSurfaceProps
>(function DetailScrollSurface(
  {
    children,
    contentContainerStyle,
    style,
    keyboardShouldPersistTaps = 'handled',
    ...scrollViewProps
  },
  ref,
) {
  return (
    <ScrollView
      {...scrollViewProps}
      ref={ref}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: {
    alignSelf: 'stretch',
    flexGrow: 1,
    minHeight: 0,
    width: '100%',
  },
  content: {
    alignSelf: 'stretch',
    flexGrow: 1,
    gap: 16,
    minHeight: 0,
    overflow: 'visible',
    width: '100%',
  },
});
