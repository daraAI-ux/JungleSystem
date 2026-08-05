import React from 'react';
import Svg, {Path} from 'react-native-svg';

const REFRESH_ICON_STROKE = '#6B7280';

export interface KolamRefreshIconProps {
  size?: number;
}

export function KolamRefreshIcon({size = 18}: KolamRefreshIconProps) {
  return (
    <Svg height={size} viewBox="0 0 64 64" width={size}>
      <Path
        d="M42.5 25.25C40.35 21.55 36.35 19.05 31.75 19.05C25.28 19.05 19.9 23.98 19.22 30.28"
        stroke={REFRESH_ICON_STROKE}
        strokeLinecap="round"
        strokeWidth="3.25"
      />
      <Path
        d="M40.85 18.6L43.85 25.95L36.25 27.2"
        stroke={REFRESH_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.25"
      />
      <Path
        d="M21.5 38.75C23.65 42.45 27.65 44.95 32.25 44.95C38.72 44.95 44.1 40.02 44.78 33.72"
        stroke={REFRESH_ICON_STROKE}
        strokeLinecap="round"
        strokeWidth="3.25"
      />
      <Path
        d="M23.15 45.4L20.15 38.05L27.75 36.8"
        stroke={REFRESH_ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.25"
      />
    </Svg>
  );
}
