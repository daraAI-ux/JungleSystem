import React from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

export function KolamDashboardRawMaterialCountIcon() {
  return (
    <Svg height={46} width={46} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="rawMaterialFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#D4F58B" />
          <Stop offset="1" stopColor="#85D64A" />
        </LinearGradient>
        <LinearGradient id="rawMaterialEdge" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#0A8B1B" />
          <Stop offset="1" stopColor="#04630E" />
        </LinearGradient>
        <LinearGradient id="rawMaterialScoop" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#B8EB63" />
          <Stop offset="1" stopColor="#59BF28" />
        </LinearGradient>
      </Defs>
      <Path
        d="M92 170C98 132 134 105 172 111C184 80 218 61 251 68C266 37 310 39 323 72C357 64 391 86 400 119C444 124 482 160 490 204C496 235 486 265 465 286C475 341 475 399 454 441C438 472 404 488 369 478C328 500 279 506 232 495C187 505 137 499 98 476C69 479 41 462 32 434C26 416 32 395 45 379C45 340 48 301 58 265C40 244 35 214 47 188C57 167 74 155 92 170Z"
        fill="url(#rawMaterialEdge)"
      />
      <Path
        d="M74 259C99 285 159 302 246 302C334 302 400 285 432 256C442 311 444 387 421 424C409 444 381 450 354 438C316 464 270 474 223 461C177 469 127 461 93 438C73 446 51 438 47 418C44 404 54 390 65 377C65 335 68 294 74 259Z"
        fill="url(#rawMaterialFill)"
      />
      <Path
        d="M78 202C92 164 132 139 170 149C181 114 223 101 251 126C267 83 327 94 333 142C368 126 407 151 410 190C451 192 481 230 467 264C450 306 371 331 248 331C124 331 45 304 43 258C42 229 55 207 78 202Z"
        fill="url(#rawMaterialFill)"
      />
      <Path
        d="M67 239C100 271 164 288 249 288C335 288 405 270 451 235"
        fill="none"
        stroke="url(#rawMaterialEdge)"
        strokeLinecap="round"
        strokeWidth={18}
      />
      <Path
        d="M65 297C83 310 106 319 134 324M59 365C78 377 100 384 126 386M402 316C424 310 442 300 456 286"
        fill="none"
        stroke="url(#rawMaterialEdge)"
        strokeLinecap="round"
        strokeWidth={14}
      />
      <Path
        d="M305 427C321 366 365 326 424 316L464 276C478 262 497 263 507 276C511 286 508 304 497 315L466 369C456 426 416 468 355 488C327 497 298 456 305 427Z"
        fill="url(#rawMaterialEdge)"
      />
      <Path
        d="M338 440C353 396 389 363 435 351L474 312L458 293L414 330C369 342 333 375 318 420C313 436 330 445 338 440Z"
        fill="url(#rawMaterialScoop)"
      />
      <Path
        d="M337 445C368 461 415 445 436 407"
        fill="none"
        stroke="#0A7D16"
        strokeLinecap="round"
        strokeWidth={14}
      />
      <Path
        d="M165 176H165.5M213 165H213.5M260 177H260.5M309 164H309.5M351 186H351.5M118 210H118.5M168 225H168.5M220 209H220.5M269 227H269.5M317 211H317.5M217 394H217.5M240 379H240.5M265 390H265.5"
        fill="none"
        stroke="url(#rawMaterialEdge)"
        strokeLinecap="round"
        strokeWidth={18}
      />
    </Svg>
  );
}
