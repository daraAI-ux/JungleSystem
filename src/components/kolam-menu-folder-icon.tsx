import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamMenuFolderIcon({
  expanded = false,
  size = 'menu',
}: {
  expanded?: boolean;
  size?: 'dock' | 'menu';
}) {
  const dimension = size === 'dock' ? 18 : 16;

  return (
    <View
      accessibilityLabel={expanded ? 'Folder terbuka' : 'Folder tertutup'}
      style={[styles.root, {height: dimension, width: dimension}]}>
      <Svg height="100%" viewBox="0 0 24 24" width="100%">
        <Path
          d={
            expanded
              ? 'M3.8 7.2h6.1l1.7 1.8h8.6c.9 0 1.6.7 1.6 1.6v1.1H6.7c-.7 0-1.3.4-1.5 1.1l-1.9 5.4V8.7c0-.8.7-1.5 1.5-1.5Z'
              : 'M3.8 6.2h5.7l1.8 1.9h8.9c.9 0 1.6.7 1.6 1.6v7.1c0 .9-.7 1.6-1.6 1.6H3.8c-.9 0-1.6-.7-1.6-1.6v-9c0-.9.7-1.6 1.6-1.6Z'
          }
          fill={expanded ? V.colors.primary : V.colors.sidebarFg}
          opacity={expanded ? 0.18 : 0.14}
        />
        <Path
          d={
            expanded
              ? 'M6.7 11.7h14.2c.7 0 1.1.7.9 1.3l-1.6 4.7c-.2.6-.8 1-1.4 1H4.6c-.7 0-1.1-.7-.9-1.3l1.6-4.7c.2-.6.8-1 1.4-1Z'
              : 'M3.8 6.2h5.7l1.8 1.9h8.9c.9 0 1.6.7 1.6 1.6v7.1c0 .9-.7 1.6-1.6 1.6H3.8c-.9 0-1.6-.7-1.6-1.6v-9c0-.9.7-1.6 1.6-1.6Z'
          }
          fill="none"
          stroke={expanded ? V.colors.primary : V.colors.sidebarFg}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
        />
        {expanded ? (
          <Path
            d="M3.3 10.9V8.7c0-.8.7-1.5 1.5-1.5h5.1l1.7 1.8h8.6c.8 0 1.5.7 1.5 1.5v1.2"
            fill="none"
            stroke={V.colors.primary}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
          />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
  },
});
