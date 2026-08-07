import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export interface KolamRefreshIconProps {
  color?: string;
  size?: number;
}

export function KolamRefreshIcon({
  color = V.colors.success,
  size = 18,
}: KolamRefreshIconProps) {
  return (
    <Svg height={size} viewBox="0 0 24 24" width={size}>
      <Path
        d="M19.25 6.25v4.6h-4.6"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.15"
      />
      <Path
        d="M4.75 17.75v-4.6h4.6"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.15"
      />
      <Path
        d="M18.42 10.85A6.8 6.8 0 0 0 6.15 8.1"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2.15"
      />
      <Path
        d="M5.58 13.15A6.8 6.8 0 0 0 17.85 15.9"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2.15"
      />
    </Svg>
  );
}
