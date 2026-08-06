import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

export function KolamTopNavigationMediaIcon(_props: {color?: string}) {
  return (
    <Svg height={22} viewBox="0 0 512 512" width={22}>
      <Circle cx={256} cy={256} fill="#050505" r={256} />
      <Path
        d="M121 220C121 191 144 168 173 168H205L216 137C221 124 233 116 247 116H292C306 116 318 124 323 137L334 168H372C401 168 424 191 424 220V331C424 360 401 383 372 383H173C144 383 121 360 121 331V220Z"
        fill="#DDF6E6"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M156 169V153C156 144 163 137 172 137H199C208 137 215 144 215 153V169H156Z"
        fill="#DDF6E6"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M200 276C200 235 231 204 272 204C313 204 344 235 344 276C344 317 313 348 272 348C231 348 200 317 200 276Z"
        fill="none"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
    </Svg>
  );
}
