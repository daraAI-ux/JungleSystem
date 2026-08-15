import {
  canonicalKolamDeviceMacPayload,
  normalizeKolamDeviceMacAddress,
  normalizeKolamDeviceMacAddressList,
} from '../src/domain/kolam-device-mac';

describe('kolam device mac', () => {
  it('normalizes MAC addresses like kolam-be', () => {
    expect(normalizeKolamDeviceMacAddress('aa-bb-cc-dd-ee-ff')).toBe(
      'AA:BB:CC:DD:EE:FF',
    );
    expect(normalizeKolamDeviceMacAddress('AABBCCDDEEFF')).toBe(
      'AA:BB:CC:DD:EE:FF',
    );
    expect(normalizeKolamDeviceMacAddress('00:00:00:00:00:00')).toBe('');
    expect(normalizeKolamDeviceMacAddress('bad')).toBe('');
  });

  it('dedupes, drops invalid, and sorts for the HMAC payload', () => {
    expect(
      normalizeKolamDeviceMacAddressList([
        'aa:bb:cc:dd:ee:ff',
        '11-22-33-44-55-66',
        'AA:BB:CC:DD:EE:FF',
        '00:00:00:00:00:00',
      ]),
    ).toEqual(['11:22:33:44:55:66', 'AA:BB:CC:DD:EE:FF']);

    expect(
      canonicalKolamDeviceMacPayload([
        'AA:BB:CC:DD:EE:FF',
        '11:22:33:44:55:66',
      ]),
    ).toBe('11:22:33:44:55:66,AA:BB:CC:DD:EE:FF');
  });
});
