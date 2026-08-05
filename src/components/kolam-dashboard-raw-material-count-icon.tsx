import React from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

export function KolamDashboardRawMaterialCountIcon() {
  return (
    <Svg height={46} width={46} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="rawMaterialBagFill" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#DDF794" />
          <Stop offset="0.55" stopColor="#BEEB72" />
          <Stop offset="1" stopColor="#8BD64F" />
        </LinearGradient>
        <LinearGradient id="rawMaterialEdge" x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#0B8F1C" />
          <Stop offset="1" stopColor="#04630E" />
        </LinearGradient>
        <LinearGradient id="rawMaterialGrainFill" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#D9F790" />
          <Stop offset="1" stopColor="#9CDD56" />
        </LinearGradient>
        <LinearGradient id="rawMaterialScoopFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#C8F06D" />
          <Stop offset="1" stopColor="#62BE28" />
        </LinearGradient>
      </Defs>
      <Path
        d="M122 142C134 107 171 89 208 94C221 59 261 41 299 55C319 16 378 20 394 64C431 57 469 80 481 119C504 127 515 169 510 216C508 243 500 267 485 286C498 339 500 408 477 452C460 483 423 493 392 477C353 501 299 512 246 500C198 509 144 501 108 479C80 487 48 470 38 440C31 417 41 394 55 376C55 345 59 311 66 278C42 252 37 212 57 181C73 156 95 144 122 142Z"
        fill="url(#rawMaterialEdge)"
      />
      <Path
        d="M76 250C106 284 174 302 267 302C358 302 432 282 479 246C493 303 493 382 469 421C454 444 421 450 392 435C352 463 300 473 248 462C200 470 142 462 106 437C84 447 59 438 54 417C50 401 62 385 74 370C73 328 73 286 76 250Z"
        fill="url(#rawMaterialBagFill)"
      />
      <Path
        d="M78 199C93 159 135 132 176 142C190 104 234 92 263 119C279 72 345 84 353 136C389 119 429 145 434 186C480 189 513 229 497 265C477 309 392 334 261 334C128 334 43 306 42 258C41 229 55 207 78 199Z"
        fill="url(#rawMaterialBagFill)"
      />
      <Path
        d="M64 235C102 273 174 291 266 291C360 291 437 271 485 233"
        fill="none"
        stroke="url(#rawMaterialEdge)"
        strokeLinecap="round"
        strokeWidth={20}
      />
      <Path
        d="M64 296C84 309 110 319 139 324M60 366C80 378 105 385 132 386M408 313C434 306 455 294 474 278"
        fill="none"
        stroke="url(#rawMaterialEdge)"
        strokeLinecap="round"
        strokeWidth={15}
      />
      <Path
        d="M301 438C316 376 365 332 431 320L466 284C480 270 499 271 509 286C517 299 512 315 499 328L464 378C455 438 414 480 358 500C328 509 293 469 301 438Z"
        fill="url(#rawMaterialEdge)"
      />
      <Path
        d="M334 449C350 403 390 369 439 356L486 310L465 289L418 335C370 348 331 384 316 428C311 445 326 455 334 449Z"
        fill="url(#rawMaterialScoopFill)"
      />
      <Path
        d="M336 454C372 472 421 452 444 412"
        fill="none"
        stroke="#0A7D16"
        strokeLinecap="round"
        strokeWidth={15}
      />
      <Path
        d="M127 164C140 138 165 125 195 130C205 101 239 92 262 113C276 75 326 83 336 123C366 108 399 128 407 160C440 163 468 187 477 220C434 247 361 263 266 263C169 263 96 246 61 215C70 187 92 168 127 164Z"
        fill="url(#rawMaterialGrainFill)"
      />
      <Path
        d="M65 235C101 269 174 287 266 287C360 287 436 268 484 232"
        fill="none"
        stroke="url(#rawMaterialEdge)"
        strokeLinecap="round"
        strokeWidth={19}
      />
      <Path
        d="M168 165H168.5M218 153H218.5M268 165H268.5M319 154H319.5M364 177H364.5M121 202H121.5M172 219H172.5M226 204H226.5M277 225H277.5M328 208H328.5M232 398H232.5M257 383H257.5M284 393H284.5"
        fill="none"
        stroke="url(#rawMaterialEdge)"
        strokeLinecap="round"
        strokeWidth={18}
      />
    </Svg>
  );
}
