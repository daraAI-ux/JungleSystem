export interface KolamBarcodeLabelItem {
  id: string;
  code: string;
  name?: string;
  price?: number;
}

const CODE128_PATTERNS = [
  '212222',
  '222122',
  '222221',
  '121223',
  '121322',
  '131222',
  '122213',
  '122312',
  '132212',
  '221213',
  '221312',
  '231212',
  '112232',
  '122132',
  '122231',
  '113222',
  '123122',
  '123221',
  '223211',
  '221132',
  '221231',
  '213212',
  '223112',
  '312131',
  '311222',
  '321122',
  '321221',
  '312212',
  '322112',
  '322211',
  '212123',
  '212321',
  '232121',
  '111323',
  '131123',
  '131321',
  '112313',
  '132113',
  '132311',
  '211313',
  '231113',
  '231311',
  '112133',
  '112331',
  '132131',
  '113123',
  '113321',
  '133121',
  '313121',
  '211331',
  '231131',
  '213113',
  '213311',
  '213131',
  '311123',
  '311321',
  '331121',
  '312113',
  '312311',
  '332111',
  '314111',
  '221411',
  '431111',
  '111224',
  '111422',
  '121124',
  '121421',
  '141122',
  '141221',
  '112214',
  '112412',
  '122114',
  '122411',
  '142112',
  '142211',
  '241211',
  '221114',
  '413111',
  '241112',
  '134111',
  '111242',
  '121142',
  '121241',
  '114212',
  '124112',
  '124211',
  '411212',
  '421112',
  '421211',
  '212141',
  '214121',
  '412121',
  '111143',
  '111341',
  '131141',
  '114113',
  '114311',
  '411113',
  '411311',
  '113141',
  '114131',
  '311141',
  '411131',
  '211412',
  '211214',
  '211232',
  '2331112',
];

const CODE128_START_B = 104;
const CODE128_STOP = 106;

export function createCode128BPattern(value: string) {
  const cleanValue = sanitizeCode128BValue(value);
  if (!cleanValue) {
    return [];
  }

  const codes = [CODE128_START_B];
  for (const character of cleanValue) {
    codes.push(character.charCodeAt(0) - 32);
  }

  let checksum = CODE128_START_B;
  for (let index = 1; index < codes.length; index += 1) {
    checksum += codes[index] * index;
  }
  codes.push(checksum % 103, CODE128_STOP);

  return codes.map(code => CODE128_PATTERNS[code]).filter(Boolean);
}

export function createCode128BHtml(value: string) {
  const patterns = createCode128BPattern(value);
  const modules = patterns.flatMap(pattern =>
    pattern.split('').map(width => Number(width) || 1),
  );
  const totalWidth = modules.reduce((total, width) => total + width, 0);
  let cursor = 0;
  const rects = modules
    .map((width, index) => {
      const x = cursor;
      cursor += width;
      if (index % 2 !== 0) {
        return '';
      }
      return `<rect x="${x}" y="0" width="${width}" height="100" fill="#000000" />`;
    })
    .join('');

  if (!totalWidth) {
    return '';
  }

  return `<svg class="barcode-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 100" preserveAspectRatio="none" role="img">${rects}</svg>`;
}

export function sanitizeCode128BValue(value: string) {
  return value
    .trim()
    .split('')
    .filter(character => {
      const code = character.charCodeAt(0);
      return code >= 32 && code <= 127;
    })
    .join('');
}

function createPatternHtml(pattern: string) {
  return pattern
    .split('')
    .map((width, index) => {
      const size = Number(width) || 1;
      const className = index % 2 === 0 ? 'bar' : 'space';
      return `<span class="${className}" style="width:${(size * 0.23).toFixed(
        2,
      )}mm"></span>`;
    })
    .join('');
}
