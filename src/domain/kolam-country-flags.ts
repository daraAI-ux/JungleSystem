export interface KolamCountryFlagOption {
  code: string;
  country: string;
  flag: string;
  imageUrl: string | null;
}

export const KOLAM_COUNTRY_FLAG_CODES = [
  'AD',
  'AE',
  'AF',
  'AG',
  'AI',
  'AL',
  'AM',
  'AO',
  'AQ',
  'AR',
  'AS',
  'AT',
  'AU',
  'AW',
  'AX',
  'AZ',
  'BA',
  'BB',
  'BD',
  'BE',
  'BF',
  'BG',
  'BH',
  'BI',
  'BJ',
  'BL',
  'BM',
  'BN',
  'BO',
  'BQ',
  'BR',
  'BS',
  'BT',
  'BV',
  'BW',
  'BY',
  'BZ',
  'CA',
  'CC',
  'CD',
  'CF',
  'CG',
  'CH',
  'CI',
  'CK',
  'CL',
  'CM',
  'CN',
  'CO',
  'CR',
  'CU',
  'CV',
  'CW',
  'CX',
  'CY',
  'CZ',
  'DE',
  'DJ',
  'DK',
  'DM',
  'DO',
  'DZ',
  'EC',
  'EE',
  'EG',
  'EH',
  'ER',
  'ES',
  'ET',
  'FI',
  'FJ',
  'FK',
  'FM',
  'FO',
  'FR',
  'GA',
  'GB',
  'GD',
  'GE',
  'GF',
  'GG',
  'GH',
  'GI',
  'GL',
  'GM',
  'GN',
  'GP',
  'GQ',
  'GR',
  'GS',
  'GT',
  'GU',
  'GW',
  'GY',
  'HK',
  'HM',
  'HN',
  'HR',
  'HT',
  'HU',
  'ID',
  'IE',
  'IL',
  'IM',
  'IN',
  'IO',
  'IQ',
  'IR',
  'IS',
  'IT',
  'JE',
  'JM',
  'JO',
  'JP',
  'KE',
  'KG',
  'KH',
  'KI',
  'KM',
  'KN',
  'KP',
  'KR',
  'KW',
  'KY',
  'KZ',
  'LA',
  'LB',
  'LC',
  'LI',
  'LK',
  'LR',
  'LS',
  'LT',
  'LU',
  'LV',
  'LY',
  'MA',
  'MC',
  'MD',
  'ME',
  'MF',
  'MG',
  'MH',
  'MK',
  'ML',
  'MM',
  'MN',
  'MO',
  'MP',
  'MQ',
  'MR',
  'MS',
  'MT',
  'MU',
  'MV',
  'MW',
  'MX',
  'MY',
  'MZ',
  'NA',
  'NC',
  'NE',
  'NF',
  'NG',
  'NI',
  'NL',
  'NO',
  'NP',
  'NR',
  'NU',
  'NZ',
  'OM',
  'PA',
  'PE',
  'PF',
  'PG',
  'PH',
  'PK',
  'PL',
  'PM',
  'PN',
  'PR',
  'PS',
  'PT',
  'PW',
  'PY',
  'QA',
  'RE',
  'RO',
  'RS',
  'RU',
  'RW',
  'SA',
  'SB',
  'SC',
  'SD',
  'SE',
  'SG',
  'SH',
  'SI',
  'SJ',
  'SK',
  'SL',
  'SM',
  'SN',
  'SO',
  'SR',
  'SS',
  'ST',
  'SV',
  'SX',
  'SY',
  'SZ',
  'TC',
  'TD',
  'TF',
  'TG',
  'TH',
  'TJ',
  'TK',
  'TL',
  'TM',
  'TN',
  'TO',
  'TR',
  'TT',
  'TV',
  'TW',
  'TZ',
  'UA',
  'UG',
  'UM',
  'US',
  'UY',
  'UZ',
  'VA',
  'VC',
  'VE',
  'VG',
  'VI',
  'VN',
  'VU',
  'WF',
  'WS',
  'YE',
  'YT',
  'ZA',
  'ZM',
  'ZW',
] as const;

export type KolamCountryCode = (typeof KOLAM_COUNTRY_FLAG_CODES)[number];

const COUNTRY_DISPLAY_NAME_ID_FALLBACKS: Record<KolamCountryCode, string> = {
  AD: 'Andorra',
  AE: 'Uni Emirat Arab',
  AF: 'Afganistan',
  AG: 'Antigua dan Barbuda',
  AI: 'Anguilla',
  AL: 'Albania',
  AM: 'Armenia',
  AO: 'Angola',
  AQ: 'Antarktika',
  AR: 'Argentina',
  AS: 'Samoa Amerika',
  AT: 'Austria',
  AU: 'Australia',
  AW: 'Aruba',
  AX: 'Kepulauan Aland',
  AZ: 'Azerbaijan',
  BA: 'Bosnia dan Herzegovina',
  BB: 'Barbados',
  BD: 'Bangladesh',
  BE: 'Belgia',
  BF: 'Burkina Faso',
  BG: 'Bulgaria',
  BH: 'Bahrain',
  BI: 'Burundi',
  BJ: 'Benin',
  BL: 'Saint Barthelemy',
  BM: 'Bermuda',
  BN: 'Brunei Darussalam',
  BO: 'Bolivia',
  BQ: 'Belanda Karibia',
  BR: 'Brasil',
  BS: 'Bahama',
  BT: 'Bhutan',
  BV: 'Pulau Bouvet',
  BW: 'Botswana',
  BY: 'Belarus',
  BZ: 'Belize',
  CA: 'Kanada',
  CC: 'Kepulauan Cocos',
  CD: 'Kongo - Kinshasa',
  CF: 'Republik Afrika Tengah',
  CG: 'Kongo - Brazzaville',
  CH: 'Swiss',
  CI: 'Pantai Gading',
  CK: 'Kepulauan Cook',
  CL: 'Cile',
  CM: 'Kamerun',
  CN: 'Tiongkok',
  CO: 'Kolombia',
  CR: 'Kosta Rika',
  CU: 'Kuba',
  CV: 'Tanjung Verde',
  CW: 'Curacao',
  CX: 'Pulau Natal',
  CY: 'Siprus',
  CZ: 'Ceko',
  DE: 'Jerman',
  DJ: 'Jibuti',
  DK: 'Denmark',
  DM: 'Dominika',
  DO: 'Republik Dominika',
  DZ: 'Aljazair',
  EC: 'Ekuador',
  EE: 'Estonia',
  EG: 'Mesir',
  EH: 'Sahara Barat',
  ER: 'Eritrea',
  ES: 'Spanyol',
  ET: 'Etiopia',
  FI: 'Finlandia',
  FJ: 'Fiji',
  FK: 'Kepulauan Falkland',
  FM: 'Mikronesia',
  FO: 'Kepulauan Faroe',
  FR: 'Prancis',
  GA: 'Gabon',
  GB: 'Inggris Raya',
  GD: 'Grenada',
  GE: 'Georgia',
  GF: 'Guyana Prancis',
  GG: 'Guernsey',
  GH: 'Ghana',
  GI: 'Gibraltar',
  GL: 'Greenland',
  GM: 'Gambia',
  GN: 'Guinea',
  GP: 'Guadeloupe',
  GQ: 'Guinea Ekuatorial',
  GR: 'Yunani',
  GS: 'Georgia Selatan dan Kepulauan Sandwich Selatan',
  GT: 'Guatemala',
  GU: 'Guam',
  GW: 'Guinea-Bissau',
  GY: 'Guyana',
  HK: 'Hong Kong',
  HM: 'Pulau Heard dan Kepulauan McDonald',
  HN: 'Honduras',
  HR: 'Kroasia',
  HT: 'Haiti',
  HU: 'Hungaria',
  ID: 'Indonesia',
  IE: 'Irlandia',
  IL: 'Israel',
  IM: 'Pulau Man',
  IN: 'India',
  IO: 'Wilayah Samudra Hindia Britania',
  IQ: 'Irak',
  IR: 'Iran',
  IS: 'Islandia',
  IT: 'Italia',
  JE: 'Jersey',
  JM: 'Jamaika',
  JO: 'Yordania',
  JP: 'Jepang',
  KE: 'Kenya',
  KG: 'Kirgizstan',
  KH: 'Kamboja',
  KI: 'Kiribati',
  KM: 'Komoro',
  KN: 'Saint Kitts dan Nevis',
  KP: 'Korea Utara',
  KR: 'Korea Selatan',
  KW: 'Kuwait',
  KY: 'Kepulauan Cayman',
  KZ: 'Kazakhstan',
  LA: 'Laos',
  LB: 'Lebanon',
  LC: 'Saint Lucia',
  LI: 'Liechtenstein',
  LK: 'Sri Lanka',
  LR: 'Liberia',
  LS: 'Lesotho',
  LT: 'Lituania',
  LU: 'Luksemburg',
  LV: 'Latvia',
  LY: 'Libya',
  MA: 'Maroko',
  MC: 'Monako',
  MD: 'Moldova',
  ME: 'Montenegro',
  MF: 'Saint Martin',
  MG: 'Madagaskar',
  MH: 'Kepulauan Marshall',
  MK: 'Makedonia Utara',
  ML: 'Mali',
  MM: 'Myanmar',
  MN: 'Mongolia',
  MO: 'Makau',
  MP: 'Kepulauan Mariana Utara',
  MQ: 'Martinik',
  MR: 'Mauritania',
  MS: 'Montserrat',
  MT: 'Malta',
  MU: 'Mauritius',
  MV: 'Maladewa',
  MW: 'Malawi',
  MX: 'Meksiko',
  MY: 'Malaysia',
  MZ: 'Mozambik',
  NA: 'Namibia',
  NC: 'Kaledonia Baru',
  NE: 'Niger',
  NF: 'Pulau Norfolk',
  NG: 'Nigeria',
  NI: 'Nikaragua',
  NL: 'Belanda',
  NO: 'Norwegia',
  NP: 'Nepal',
  NR: 'Nauru',
  NU: 'Niue',
  NZ: 'Selandia Baru',
  OM: 'Oman',
  PA: 'Panama',
  PE: 'Peru',
  PF: 'Polinesia Prancis',
  PG: 'Papua Nugini',
  PH: 'Filipina',
  PK: 'Pakistan',
  PL: 'Polandia',
  PM: 'Saint Pierre dan Miquelon',
  PN: 'Kepulauan Pitcairn',
  PR: 'Puerto Riko',
  PS: 'Palestina',
  PT: 'Portugal',
  PW: 'Palau',
  PY: 'Paraguay',
  QA: 'Qatar',
  RE: 'Reunion',
  RO: 'Rumania',
  RS: 'Serbia',
  RU: 'Rusia',
  RW: 'Rwanda',
  SA: 'Arab Saudi',
  SB: 'Kepulauan Solomon',
  SC: 'Seychelles',
  SD: 'Sudan',
  SE: 'Swedia',
  SG: 'Singapura',
  SH: 'Saint Helena',
  SI: 'Slovenia',
  SJ: 'Svalbard dan Jan Mayen',
  SK: 'Slowakia',
  SL: 'Sierra Leone',
  SM: 'San Marino',
  SN: 'Senegal',
  SO: 'Somalia',
  SR: 'Suriname',
  SS: 'Sudan Selatan',
  ST: 'Sao Tome dan Principe',
  SV: 'El Salvador',
  SX: 'Sint Maarten',
  SY: 'Suriah',
  SZ: 'Eswatini',
  TC: 'Kepulauan Turks dan Caicos',
  TD: 'Chad',
  TF: 'Wilayah Selatan Prancis',
  TG: 'Togo',
  TH: 'Thailand',
  TJ: 'Tajikistan',
  TK: 'Tokelau',
  TL: 'Timor Leste',
  TM: 'Turkmenistan',
  TN: 'Tunisia',
  TO: 'Tonga',
  TR: 'Turki',
  TT: 'Trinidad dan Tobago',
  TV: 'Tuvalu',
  TW: 'Taiwan',
  TZ: 'Tanzania',
  UA: 'Ukraina',
  UG: 'Uganda',
  UM: 'Kepulauan Terluar Amerika Serikat',
  US: 'Amerika Serikat',
  UY: 'Uruguay',
  UZ: 'Uzbekistan',
  VA: 'Vatikan',
  VC: 'Saint Vincent dan Grenadine',
  VE: 'Venezuela',
  VG: 'Kepulauan Virgin Britania Raya',
  VI: 'Kepulauan Virgin Amerika Serikat',
  VN: 'Vietnam',
  VU: 'Vanuatu',
  WF: 'Wallis dan Futuna',
  WS: 'Samoa',
  YE: 'Yaman',
  YT: 'Mayotte',
  ZA: 'Afrika Selatan',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
};

const COUNTRY_CODE_ALIASES: Record<string, KolamCountryCode> = {
  'amerika serikat': 'US',
  britania: 'GB',
  brunei: 'BN',
  china: 'CN',
  cina: 'CN',
  hongkong: 'HK',
  indonesia: 'ID',
  inggris: 'GB',
  jepang: 'JP',
  jerman: 'DE',
  korea: 'KR',
  'korea selatan': 'KR',
  'korea republic of': 'KR',
  malaysia: 'MY',
  prancis: 'FR',
  'republic of korea': 'KR',
  rusia: 'RU',
  'russian federation': 'RU',
  singapura: 'SG',
  'south korea': 'KR',
  taiwan: 'TW',
  thailand: 'TH',
  tiongkok: 'CN',
  uk: 'GB',
  'united kingdom': 'GB',
  'united states': 'US',
  'united states of america': 'US',
  usa: 'US',
  vietnam: 'VN',
};

export const KOLAM_COUNTRY_FLAG_OPTIONS: KolamCountryFlagOption[] =
  KOLAM_COUNTRY_FLAG_CODES.map(code => ({
    code,
    country: getCountryDisplayName(code),
    flag: getCountryFlagIcon(code),
    imageUrl: getCountryFlagImageUrl(code),
  }));

export function getCountryFlagImageUrl(code: string) {
  const normalized = code.trim().toUpperCase();
  const svg = getCountryFlagSvg(normalized);

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getCountryFlagIcon(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return normalized;
  }

  return String.fromCodePoint(
    ...normalized
      .split('')
      .map(character => 0x1f1e6 + character.charCodeAt(0) - 65),
  );
}

export function getCountryDisplayName(code: string) {
  const normalized = code.trim().toUpperCase();
  const localName =
    COUNTRY_DISPLAY_NAME_ID_FALLBACKS[normalized as KolamCountryCode];
  if (localName) {
    return localName;
  }

  try {
    const displayNames = new Intl.DisplayNames(['id', 'en'], {
      type: 'region',
    });
    return displayNames.of(normalized) ?? normalized;
  } catch {
    return normalized;
  }
}

export function getKolamCountryFlagByCountry(countryOrCode: string) {
  const normalized = normalizeCountrySearchValue(countryOrCode);
  const aliasCode = COUNTRY_CODE_ALIASES[normalized];

  const matched =
    (aliasCode
      ? KOLAM_COUNTRY_FLAG_OPTIONS.find(option => option.code === aliasCode)
      : undefined) ??
    KOLAM_COUNTRY_FLAG_OPTIONS.find(
      option =>
        normalizeCountrySearchValue(option.country) === normalized ||
        normalizeCountrySearchValue(getCountryEnglishName(option.code)) ===
          normalized ||
        option.code.toLowerCase() === normalized,
    );

  return (
    matched ?? {
      code: '',
      country: countryOrCode.trim() || 'Tidak diketahui',
      flag: '',
      imageUrl: null,
    }
  );
}

function getCountryEnglishName(code: string) {
  const normalized = code.trim().toUpperCase();
  try {
    const displayNames = new Intl.DisplayNames(['en'], {
      type: 'region',
    });
    return displayNames.of(normalized) ?? normalized;
  } catch {
    return normalized;
  }
}

function normalizeCountrySearchValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getCountryFlagSvg(code: string) {
  const flagBody =
    getKnownCountryFlagBody(code) ?? getFallbackCountryFlagBody(code);

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="56" viewBox="0 0 80 56">',
    '<rect width="80" height="56" rx="8" fill="#f8fafc"/>',
    '<g clip-path="url(#r)">',
    flagBody,
    '</g>',
    '<rect x="0.5" y="0.5" width="79" height="55" rx="7.5" fill="none" stroke="#d1d5db"/>',
    '<defs><clipPath id="r"><rect width="80" height="56" rx="8"/></clipPath></defs>',
    '</svg>',
  ].join('');
}

function getKnownCountryFlagBody(code: string) {
  switch (code) {
    case 'ID':
    case 'PL':
      return '<rect width="80" height="28" fill="#ef4444"/><rect y="28" width="80" height="28" fill="#ffffff"/>';
    case 'JP':
      return '<rect width="80" height="56" fill="#ffffff"/><circle cx="40" cy="28" r="14" fill="#bc002d"/>';
    case 'US':
      return '<rect width="80" height="56" fill="#ffffff"/><path d="M0 0h80v4H0zm0 8h80v4H0zm0 8h80v4H0zm0 8h80v4H0zm0 8h80v4H0zm0 8h80v4H0zm0 8h80v4H0z" fill="#b91c1c"/><rect width="36" height="28" fill="#1d4ed8"/>';
    case 'GB':
    case 'AU':
      return '<rect width="80" height="56" fill="#1e3a8a"/><path d="M0 0l80 56M80 0L0 56" stroke="#ffffff" stroke-width="11"/><path d="M0 0l80 56M80 0L0 56" stroke="#dc2626" stroke-width="5"/><path d="M34 0h12v56H34zM0 22h80v12H0z" fill="#ffffff"/><path d="M37 0h6v56h-6zM0 25h80v6H0z" fill="#dc2626"/>';
    case 'CN':
    case 'HK':
    case 'VN':
      return '<rect width="80" height="56" fill="#dc2626"/><path d="M22 10l4 10 11 1-8 7 2 11-9-6-9 6 2-11-8-7 11-1z" fill="#facc15"/>';
    case 'SG':
      return '<rect width="80" height="28" fill="#dc2626"/><rect y="28" width="80" height="28" fill="#ffffff"/><circle cx="22" cy="14" r="9" fill="#ffffff"/><circle cx="26" cy="14" r="8" fill="#dc2626"/>';
    case 'MY':
      return '<rect width="80" height="56" fill="#ffffff"/><path d="M0 0h80v4H0zm0 8h80v4H0zm0 8h80v4H0zm0 8h80v4H0zm0 8h80v4H0zm0 8h80v4H0zm0 8h80v4H0z" fill="#dc2626"/><rect width="36" height="32" fill="#1d4ed8"/><circle cx="18" cy="16" r="9" fill="#facc15"/><circle cx="22" cy="16" r="8" fill="#1d4ed8"/>';
    case 'TH':
      return '<rect width="80" height="56" fill="#dc2626"/><rect y="9" width="80" height="38" fill="#ffffff"/><rect y="19" width="80" height="18" fill="#1e3a8a"/>';
    case 'KR':
      return '<rect width="80" height="56" fill="#ffffff"/><path d="M40 14a14 14 0 0 1 0 28 7 7 0 0 0 0-14 7 7 0 0 1 0-14z" fill="#dc2626"/><path d="M40 14a7 7 0 0 0 0 14 7 7 0 0 1 0 14 14 14 0 0 1 0-28z" fill="#2563eb"/>';
    case 'DE':
      return '<rect width="80" height="18.7" fill="#111827"/><rect y="18.7" width="80" height="18.6" fill="#dc2626"/><rect y="37.3" width="80" height="18.7" fill="#facc15"/>';
    case 'FR':
    case 'NL':
      return '<rect width="26.7" height="56" fill="#2563eb"/><rect x="26.7" width="26.6" height="56" fill="#ffffff"/><rect x="53.3" width="26.7" height="56" fill="#dc2626"/>';
    case 'BR':
      return '<rect width="80" height="56" fill="#16a34a"/><path d="M40 8l30 20-30 20L10 28z" fill="#facc15"/><circle cx="40" cy="28" r="12" fill="#1d4ed8"/>';
    case 'IN':
      return '<rect width="80" height="18.7" fill="#f97316"/><rect y="18.7" width="80" height="18.6" fill="#ffffff"/><rect y="37.3" width="80" height="18.7" fill="#16a34a"/><circle cx="40" cy="28" r="6" fill="none" stroke="#1d4ed8" stroke-width="2"/>';
    case 'PH':
      return '<rect width="80" height="28" fill="#2563eb"/><rect y="28" width="80" height="28" fill="#dc2626"/><path d="M0 0l36 28L0 56z" fill="#ffffff"/><circle cx="12" cy="28" r="5" fill="#facc15"/>';
    case 'RU':
      return '<rect width="80" height="18.7" fill="#ffffff"/><rect y="18.7" width="80" height="18.6" fill="#2563eb"/><rect y="37.3" width="80" height="18.7" fill="#dc2626"/>';
    default:
      return null;
  }
}

function getFallbackCountryFlagBody(code: string) {
  const palette = [
    '#0f766e',
    '#2563eb',
    '#dc2626',
    '#f59e0b',
    '#16a34a',
    '#7c3aed',
    '#be123c',
    '#0891b2',
  ];
  const first = code.charCodeAt(0) || 0;
  const second = code.charCodeAt(1) || first + 3;
  const a = palette[first % palette.length];
  const c = palette[second % palette.length];

  return `<rect width="80" height="18.7" fill="${a}"/><rect y="18.7" width="80" height="18.6" fill="#ffffff"/><rect y="37.3" width="80" height="18.7" fill="${c}"/>`;
}
