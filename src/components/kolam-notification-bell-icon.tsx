import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

export interface KolamNotificationBellIconProps {
  color?: string;
}

export function KolamNotificationBellIcon(
  _props: KolamNotificationBellIconProps,
) {
  return (
    <Svg height={22} viewBox="0 0 64 64" width={22}>
      <Circle cx={32} cy={32} fill="#050505" r={32} />
      <Path
        d="M32 13C29.42 13 27.3 15.02 27.16 17.56C20.66 19.42 18.62 25.28 18.62 33.72C18.62 40.24 15.78 43.96 13.68 46.2C12.66 47.28 13.46 49 14.94 49H49.06C50.54 49 51.34 47.28 50.32 46.2C48.22 43.96 45.38 40.24 45.38 33.72C45.38 25.28 43.34 19.42 36.84 17.56C36.7 15.02 34.58 13 32 13Z"
        fill="#9CFF7A"
      />
      <Path
        d="M26.7 51.2C27.5 54.36 29.38 56.5 32 56.5C34.62 56.5 36.5 54.36 37.3 51.2H26.7Z"
        fill="#9CFF7A"
      />
    </Svg>
  );
}
