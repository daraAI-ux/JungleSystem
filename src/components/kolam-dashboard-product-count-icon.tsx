import React from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

export function KolamDashboardProductCountIcon() {
  return (
    <Svg height={46} width={46} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="productBoxFace" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#B8F27A" />
          <Stop offset="1" stopColor="#76D64E" />
        </LinearGradient>
        <LinearGradient id="productBoxEdge" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0D8C19" />
          <Stop offset="1" stopColor="#04630E" />
        </LinearGradient>
      </Defs>
      <Path
        d="M256 52C294 52 413 121 438 144C459 164 471 187 471 217V344C471 381 451 414 419 433L311 495C276 515 234 515 199 495L92 433C60 414 41 381 41 344V217C41 187 53 164 74 144C99 121 218 52 256 52Z"
        fill="url(#productBoxEdge)"
      />
      <Path
        d="M102 190L254 277V459C242 459 230 456 220 450L112 388C93 377 82 358 82 336V226C82 211 88 199 102 190Z"
        fill="url(#productBoxFace)"
      />
      <Path
        d="M410 190C424 199 430 211 430 226V336C430 358 419 377 400 388L292 450C282 456 270 459 258 459V277L410 190Z"
        fill="url(#productBoxFace)"
      />
      <Path
        d="M116 157L223 95C243 84 269 84 289 95L396 157L258 236L116 157Z"
        fill="#9FEF6E"
      />
      <Path
        d="M204 108L352 190L301 220L152 137L204 108Z"
        fill="url(#productBoxEdge)"
      />
      <Path
        d="M292 95L397 156L351 182L246 121L292 95Z"
        fill="#B8F27A"
      />
      <Path
        d="M258 236L258 459"
        fill="none"
        stroke="url(#productBoxEdge)"
        strokeLinecap="round"
        strokeWidth={24}
      />
      <Path
        d="M349 188V268C349 282 365 290 377 282L410 262V190L349 188Z"
        fill="url(#productBoxEdge)"
      />
      <Path
        d="M331 327L367 306C382 297 401 308 401 326V382C401 393 395 403 385 409L349 430C334 439 315 428 315 410V354C315 343 321 333 331 327Z"
        fill="url(#productBoxEdge)"
      />
      <Path
        d="M355 367C355 359 361 353 369 353C377 353 383 359 383 367C383 375 377 381 369 381C361 381 355 375 355 367Z"
        fill="#A7EC72"
      />
    </Svg>
  );
}
