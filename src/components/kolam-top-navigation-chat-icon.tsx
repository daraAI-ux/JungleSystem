import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';

export function KolamTopNavigationChatIcon({
  kind,
}: {
  kind: 'inbox' | 'team';
  color?: string;
}) {
  if (kind === 'team') {
    return (
      <Svg height={22} viewBox="0 0 512 512" width={22}>
        <Circle cx={256} cy={256} fill="#050505" r={256} />
        <Path
          d="M238 159H386C404 159 420 166 432 178C444 190 451 206 451 224V247C451 265 444 281 432 293C420 305 404 312 386 312H382V361L329 312H238C220 312 204 305 192 293C180 281 173 265 173 247V224C173 206 180 190 192 178C204 166 220 159 238 159Z"
          fill="#DDF6E6"
          stroke="#000000"
          strokeLinejoin="round"
          strokeWidth={7}
        />
        <Path
          d="M128 215H248C266 215 282 222 294 234C306 246 313 262 313 280V309C313 327 306 343 294 355C282 367 266 374 248 374H186L132 407V374H128C110 374 94 367 82 355C70 343 63 327 63 309V280C63 262 70 246 82 234C94 222 110 215 128 215Z"
          fill="#DDF6E6"
          stroke="#000000"
          strokeLinejoin="round"
          strokeWidth={7}
        />
        <Path
          d="M294 194H369M294 216H369M294 238H369M144 270H230M144 293H230M144 316H230"
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeWidth={7}
        />
      </Svg>
    );
  }

  return (
    <Svg height={22} viewBox="0 0 512 512" width={22}>
      <Circle cx={256} cy={256} fill="#050505" r={256} />
      <Path
        d="M155 222C155 164 200 119 256 119C312 119 357 164 357 222V238H329V222C329 180 297 148 256 148C215 148 183 180 183 222V238H155V222Z"
        fill="#DDF6E6"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M149 225H170C187 225 200 238 200 255V305C200 322 187 335 170 335H149C125 335 106 316 106 292V268C106 244 125 225 149 225Z"
        fill="#DDF6E6"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M363 225H342C325 225 312 238 312 255V305C312 322 325 335 342 335H363C387 335 406 316 406 292V268C406 244 387 225 363 225Z"
        fill="#DDF6E6"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M185 254C185 211 216 177 256 177C296 177 327 211 327 254V301C327 344 296 378 256 378C216 378 185 344 185 301V254Z"
        fill="#DDF6E6"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M358 330V342C358 371 335 394 306 394H279"
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeWidth={7}
      />
      <Path
        d="M250 358H282C299 358 312 371 312 388C312 405 299 418 282 418H250C233 418 220 405 220 388C220 371 233 358 250 358Z"
        fill="#DDF6E6"
        stroke="#000000"
        strokeLinejoin="round"
        strokeWidth={7}
      />
      <Path
        d="M222 263H222.5M290 263H290.5M238 300C248 309 264 309 274 300"
        fill="none"
        stroke="#000000"
        strokeLinecap="round"
        strokeWidth={10}
      />
    </Svg>
  );
}
