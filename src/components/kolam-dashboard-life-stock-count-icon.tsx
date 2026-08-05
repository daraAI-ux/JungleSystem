import React from 'react';
import Svg, {Defs, LinearGradient, Path, Stop} from 'react-native-svg';

export function KolamDashboardLifeStockCountIcon() {
  return (
    <Svg height={46} width={46} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="lifeStockFaceFill" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#C9F864" />
          <Stop offset="0.58" stopColor="#9EEA38" />
          <Stop offset="1" stopColor="#7ED421" />
        </LinearGradient>
        <LinearGradient id="lifeStockEdge" x1="0.1" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor="#10A91E" />
          <Stop offset="1" stopColor="#046C0C" />
        </LinearGradient>
        <LinearGradient id="lifeStockEyeFill" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#0E8F16" />
          <Stop offset="1" stopColor="#05690B" />
        </LinearGradient>
        <LinearGradient id="lifeStockBellyFill" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#E6F9A7" />
          <Stop offset="1" stopColor="#B8ED69" />
        </LinearGradient>
      </Defs>
      <Path
        d="M150 132C150 82 191 41 242 41C285 41 321 70 331 110C352 105 374 102 398 102C422 102 446 105 468 112C476 70 513 39 557 39C608 39 649 80 649 131C649 161 635 188 613 205C650 234 672 277 672 325C672 393 626 452 561 468L570 506C573 520 563 534 548 534H247C232 534 222 520 225 506L234 468C169 452 123 393 123 325C123 277 145 234 182 205C162 188 150 162 150 132Z"
        fill="url(#lifeStockEdge)"
        transform="translate(-141 0)"
      />
      <Path
        d="M193 126C193 99 215 77 242 77C269 77 291 99 291 126C291 150 274 170 252 174C245 175 239 175 232 174C210 170 193 150 193 126Z"
        fill="url(#lifeStockFaceFill)"
      />
      <Path
        d="M363 126C363 99 385 77 412 77C439 77 461 99 461 126C461 150 444 170 422 174C415 175 409 175 402 174C380 170 363 150 363 126Z"
        fill="url(#lifeStockFaceFill)"
      />
      <Path
        d="M64 322C64 245 127 183 205 183H307C385 183 448 245 448 322C448 379 412 428 361 448L365 486H147L151 448C100 428 64 379 64 322Z"
        fill="url(#lifeStockFaceFill)"
      />
      <Path
        d="M161 445C176 409 213 386 256 386C299 386 336 409 351 445C322 456 289 462 256 462C223 462 190 456 161 445Z"
        fill="url(#lifeStockBellyFill)"
      />
      <Path
        d="M180 126C180 91 207 63 242 63C277 63 304 91 304 126M350 126C350 91 377 63 412 63C447 63 474 91 474 126"
        fill="none"
        stroke="url(#lifeStockEdge)"
        strokeLinecap="round"
        strokeWidth={22}
      />
      <Path
        d="M177 126C177 90 206 61 242 61C278 61 307 90 307 126C307 145 299 163 286 175M335 175C322 163 314 145 314 126C314 90 343 61 379 61C415 61 444 90 444 126"
        fill="none"
        stroke="url(#lifeStockEdge)"
        strokeLinecap="round"
        strokeWidth={16}
      />
      <Path
        d="M178 121C178 94 200 72 228 72C255 72 277 94 277 121C277 148 255 170 228 170C200 170 178 148 178 121Z"
        fill="#B9F059"
      />
      <Path
        d="M335 121C335 94 357 72 385 72C412 72 434 94 434 121C434 148 412 170 385 170C357 170 335 148 335 121Z"
        fill="#B9F059"
      />
      <Path
        d="M203 121C203 96 222 77 247 77C272 77 291 96 291 121C291 146 272 165 247 165C222 165 203 146 203 121Z"
        fill="url(#lifeStockEyeFill)"
      />
      <Path
        d="M361 121C361 96 380 77 405 77C430 77 449 96 449 121C449 146 430 165 405 165C380 165 361 146 361 121Z"
        fill="url(#lifeStockEyeFill)"
      />
      <Path
        d="M229 103C229 92 238 83 249 83C260 83 269 92 269 103C269 114 260 123 249 123C238 123 229 114 229 103Z"
        fill="#FFFFFF"
      />
      <Path
        d="M388 103C388 92 397 83 408 83C419 83 428 92 428 103C428 114 419 123 408 123C397 123 388 114 388 103Z"
        fill="#FFFFFF"
      />
      <Path
        d="M64 321C64 244 126 182 205 182H307C386 182 448 244 448 321C448 379 412 428 361 448L365 486H147L151 448C100 428 64 379 64 321Z"
        fill="none"
        stroke="url(#lifeStockEdge)"
        strokeLinejoin="round"
        strokeWidth={18}
      />
      <Path
        d="M156 289C180 328 217 348 256 348C295 348 332 328 356 289"
        fill="none"
        stroke="url(#lifeStockEdge)"
        strokeLinecap="round"
        strokeWidth={16}
      />
      <Path
        d="M161 289L152 298M351 289L360 298"
        fill="none"
        stroke="url(#lifeStockEdge)"
        strokeLinecap="round"
        strokeWidth={16}
      />
      <Path
        d="M235 250C235 238 241 229 249 229C257 229 263 238 263 250C263 262 257 271 249 271C241 271 235 262 235 250Z"
        fill="url(#lifeStockEdge)"
      />
      <Path
        d="M293 250C293 238 299 229 307 229C315 229 321 238 321 250C321 262 315 271 307 271C299 271 293 262 293 250Z"
        fill="url(#lifeStockEdge)"
      />
      <Path
        d="M92 234C92 220 103 209 117 209C131 209 142 220 142 234C142 248 131 259 117 259C103 259 92 248 92 234Z"
        fill="#67BF20"
      />
      <Path
        d="M81 285C81 273 91 263 103 263C115 263 125 273 125 285C125 297 115 307 103 307C91 307 81 297 81 285Z"
        fill="#69BF20"
      />
      <Path
        d="M371 234C371 220 382 209 396 209C410 209 421 220 421 234C421 248 410 259 396 259C382 259 371 248 371 234Z"
        fill="#67BF20"
      />
      <Path
        d="M400 285C400 273 410 263 422 263C434 263 444 273 444 285C444 297 434 307 422 307C410 307 400 297 400 285Z"
        fill="#69BF20"
      />
    </Svg>
  );
}
