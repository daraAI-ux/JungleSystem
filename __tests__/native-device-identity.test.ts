import {appConfig} from '../src/config/app';
import {
  bootstrapNativeDeviceIdentity,
  normalizeNativeDeviceIdentity,
  readNativeDeviceIdentity,
} from '../src/services/native-device-identity';
import {
  apiRequest,
  clearNativeDeviceIdentity,
  setAccessToken,
} from '../src/lib/api-client';

const fetchMock = jest.fn();

describe('native device identity bootstrap', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({ok: true}));
    globalThis.fetch = fetchMock;
    setAccessToken(undefined);
    clearNativeDeviceIdentity();
  });

  it('normalizes MAC payloads from the Windows native bridge', () => {
    expect(
      normalizeNativeDeviceIdentity({
        deviceMacAddresses: ['aa:bb:cc:dd:ee:ff', '11-22-33-44-55-66'],
        deviceMacSignature: 'signed-macs',
      }),
    ).toEqual({
      macAddresses: ['AA:BB:CC:DD:EE:FF', '11-22-33-44-55-66'],
      macSignature: 'signed-macs',
    });

    expect(
      normalizeNativeDeviceIdentity({
        macAddress: 'aa:bb:cc:dd:ee:ff; 11-22-33-44-55-66',
      }),
    ).toEqual({
      macAddresses: ['AA:BB:CC:DD:EE:FF', '11-22-33-44-55-66'],
      macSignature: undefined,
    });
  });

  it('reads signed MAC identity from KolamWindowsDeviceIdentity on Windows', async () => {
    await expect(
      readNativeDeviceIdentity({
        platformOS: 'windows',
        nativeModules: {
          KolamWindowsDeviceIdentity: {
            getDeviceIdentity: () => ({
              macAddresses: ['aa:bb:cc:dd:ee:ff'],
              macSignature: 'signed-macs',
            }),
          },
        },
      }),
    ).resolves.toEqual({
      macAddresses: ['AA:BB:CC:DD:EE:FF'],
      macSignature: 'signed-macs',
    });
  });

  it('bootstraps signed MAC headers for subsequent API requests', async () => {
    const status = await bootstrapNativeDeviceIdentity({
      platformOS: 'windows',
      nativeModules: {
        KolamWindowsDeviceIdentity: {
          getDeviceIdentity: async () => ({
            macAddresses: ['aa:bb:cc:dd:ee:ff'],
            macSignature: 'signed-macs',
          }),
        },
      },
    });

    expect(status).toBe('signed');

    await apiRequest({method: 'GET', path: '/auth/detail-user'});

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.apiBaseUrl}/auth/detail-user`,
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-device-mac': 'AA:BB:CC:DD:EE:FF',
          'x-device-mac-signature': 'signed-macs',
        }),
      }),
    );
  });

  it('keeps MAC-only identity partial when the native signature is missing', async () => {
    const status = await bootstrapNativeDeviceIdentity({
      platformOS: 'windows',
      nativeModules: {
        KolamDeviceIdentity: {
          getAppInfo: () => ({
            deviceMac: 'aa:bb:cc:dd:ee:ff',
          }),
        },
      },
    });

    expect(status).toBe('mac-only');

    await apiRequest({method: 'GET', path: '/health'});

    expect(fetchMock).toHaveBeenCalledWith(
      `${appConfig.apiBaseUrl}/health`,
      expect.objectContaining({
        headers: expect.not.objectContaining({
          'x-device-mac-signature': expect.any(String),
        }),
      }),
    );
  });

  it('clears device identity when the Windows bridge is missing or unavailable', async () => {
    await expect(
      bootstrapNativeDeviceIdentity({
        platformOS: 'windows',
        nativeModules: {},
      }),
    ).resolves.toBe('missing');

    await expect(
      bootstrapNativeDeviceIdentity({
        platformOS: 'windows',
        nativeModules: {
          KolamWindowsDeviceIdentity: {
            getDeviceIdentity: () => {
              throw new Error('bridge unavailable');
            },
          },
        },
      }),
    ).resolves.toBe('missing');
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
