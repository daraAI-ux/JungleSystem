import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useKolamWorkspaceScrollContext } from './kolam-workspace-scroll-context';

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
  const workspaceScroll = useKolamWorkspaceScrollContext();
  const localScrollRef = React.useRef<ScrollView>(null);

  React.useImperativeHandle(
    ref,
    () => {
      if (workspaceScroll.scrollOwner === 'shell') {
        return {
          scrollTo: (options: {animated?: boolean; x?: number; y?: number}) =>
            workspaceScroll.scrollTo?.(options),
          scrollToEnd: (options?: {animated?: boolean}) =>
            workspaceScroll.scrollTo?.({
              animated: options?.animated,
              y: Number.MAX_SAFE_INTEGER,
            }),
        } as React.ElementRef<typeof ScrollView>;
      }

      return (localScrollRef.current ?? {
        scrollTo: () => undefined,
        scrollToEnd: () => undefined,
      }) as React.ElementRef<typeof ScrollView>;
    },
    [workspaceScroll],
  );

  if (workspaceScroll.scrollOwner === 'shell') {
    return (
      <View style={[styles.scroll, style]}>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      {...scrollViewProps}
      ref={localScrollRef}
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
