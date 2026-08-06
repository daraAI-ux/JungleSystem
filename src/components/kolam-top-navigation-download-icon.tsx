import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

export function KolamTopNavigationDownloadIcon(_props: {color?: string}) {
  return (
    <Svg height={22} viewBox="0 0 512 512" width={22}>
      <Circle cx={256} cy={256} fill="#050505" r={256} />
      <Path
        d="M225 126H287C305 126 319 140 319 158V258H352C367 258 375 276 365 287L279 377C267 390 245 390 233 377L147 287C137 276 145 258 160 258H193V158C193 140 207 126 225 126Z"
        fill="#9CFF7A"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M128 317V360C128 384 147 403 171 403H341C365 403 384 384 384 360V317H345V347C345 358 336 367 325 367H187C176 367 167 358 167 347V317H128Z"
        fill="#9CFF7A"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
    </Svg>
  );
}
