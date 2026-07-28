import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import type { ModuleNavIconGlyphProps } from './kolam-module-nav-icon-types';

export function ModuleNavPreparationIcon({
  tintStyle,
}: ModuleNavIconGlyphProps) {
  const color = getTintColor(tintStyle);

  return (
    <Svg
      fill="none"
      height={18}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.9}
      viewBox="0 0 24 24"
      width={18}
    >
      <Rect height={15} rx={2} width={14} x={5} y={5} />
      <Path d="M9 5a3 3 0 0 1 6 0" />
      <Path d="M9 11h6M9 15h4" />
    </Svg>
  );
}

function getTintColor(tintStyle: ModuleNavIconGlyphProps['tintStyle']) {
  return String(StyleSheet.flatten(tintStyle)?.backgroundColor ?? '#64748b');
}
