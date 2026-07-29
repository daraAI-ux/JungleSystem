import { getLocalDataStore } from './local-data-store';

export interface KolamTimezoneOption {
  id: string;
  label: string;
  region: string;
}

const TIMEZONE_CACHE_KEY = 'reference:iana-timezones:all';
const TIMEZONE_CACHE_REVISION = 'iana-timezones:intl-supported-values:v1';
const FALLBACK_TIMEZONES = [
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura',
  'UTC',
];

export function getKolamTimezoneCacheKey() {
  return TIMEZONE_CACHE_KEY;
}

export async function readKolamTimezoneDatabase() {
  return getLocalDataStore().read<KolamTimezoneOption[]>(TIMEZONE_CACHE_KEY);
}

export async function ensureKolamTimezoneDatabase() {
  const timezones = getRuntimeIanaTimezones();
  const options = createKolamTimezoneOptions(timezones);
  const current = await readKolamTimezoneDatabase();

  if (current?.revision === TIMEZONE_CACHE_REVISION) {
    return current.value;
  }

  await getLocalDataStore().write({
    key: TIMEZONE_CACHE_KEY,
    value: options,
    revision: TIMEZONE_CACHE_REVISION,
    updatedAt: new Date().toISOString(),
  });

  return options;
}

export function getRuntimeIanaTimezones() {
  const supportedValuesOf = (
    Intl as unknown as {
      supportedValuesOf?: (key: 'timeZone') => string[];
    }
  ).supportedValuesOf;

  try {
    const values = supportedValuesOf?.('timeZone') ?? [];
    const unique = Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );

    return unique.length ? unique : FALLBACK_TIMEZONES;
  } catch {
    return FALLBACK_TIMEZONES;
  }
}

export function createKolamTimezoneOptions(timezones: string[]) {
  return Array.from(new Set(timezones))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .map(id => ({
      id,
      label: id.replace(/_/g, ' '),
      region: id.includes('/') ? id.split('/')[0] : 'UTC',
    }));
}
