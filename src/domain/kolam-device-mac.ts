/** Canonical MAC helpers — must match kolam-be `utils/auth/mac-signature.js`. */

const ZERO_MAC = '00:00:00:00:00:00';

export function normalizeKolamDeviceMacAddress(value: unknown): string {
  const raw = String(value ?? '')
    .trim()
    .toUpperCase();
  if (!raw) {
    return '';
  }

  const hex = raw.replace(/[^0-9A-F]/g, '');
  if (hex.length !== 12 || !/^[0-9A-F]{12}$/.test(hex)) {
    return '';
  }

  const mac = hex.match(/.{2}/g)?.join(':') ?? '';
  if (!mac || mac === ZERO_MAC) {
    return '';
  }

  return mac;
}

export function normalizeKolamDeviceMacAddressList(
  values: unknown,
): string[] {
  const list = Array.isArray(values) ? values : [values];
  const unique = new Set<string>();

  for (const item of list) {
    for (const part of String(item ?? '').split(/[,;]/)) {
      const mac = normalizeKolamDeviceMacAddress(part);
      if (mac) {
        unique.add(mac);
      }
    }
  }

  return [...unique].sort();
}

export function canonicalKolamDeviceMacPayload(macs: string[]): string {
  return normalizeKolamDeviceMacAddressList(macs).join(',');
}
