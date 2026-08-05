import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

export function KolamTopNavigationTaskIcon(_props: {color?: string}) {
  return (
    <Svg height={22} viewBox="0 0 512 512" width={22}>
      <Circle cx={256} cy={256} fill="#F47F65" r={256} />
      <Path
        d="M160 147H211C216 130 231 119 250 119H262C281 119 296 130 301 147H352C379 147 401 169 401 196V365C401 392 379 414 352 414H160C133 414 111 392 111 365V196C111 169 133 147 160 147Z"
        fill="#F1B4CC"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M213 132H299C315 132 328 145 328 161V186C328 202 315 215 299 215H213C197 215 184 202 184 186V161C184 145 197 132 213 132Z"
        fill="#F1B4CC"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M171 249L194 272L224 239M171 306L194 329L224 296M171 363L194 386L224 353"
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={10}
      />
      <Path
        d="M259 255H346M259 312H346M259 369H346"
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeWidth={10}
      />
    </Svg>
  );
}
