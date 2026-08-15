import {appConfig} from '../src/config/app';
import {
  fetchKolamPackageLatestRelease,
  getKolamPackageUpdateLatestUrl,
  KolamPackageUpdateRequestError,
} from '../src/services/kolam-package-update-api';
import {getAccessToken, getNativeDeviceIdentity} from '../src/lib/api-client';

jest.mock('../src/lib/api-client', () => ({
  getAccessToken: jest.fn(),
  getNativeDeviceIdentity: jest.fn(),
}));

const VALID_SHA512 = 'ab'.repeat(64);
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;
const mockedGetNativeDeviceIdentity =
  getNativeDeviceIdentity as jest.MockedFunction<typeof getNativeDeviceIdentity>;

describe('kolam package update api', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
    mockedGetAccessToken.mockReset();
    mockedGetAccessToken.mockReturnValue('test-token');
    mockedGetNativeDeviceIdentity.mockReset();
    mockedGetNativeDeviceIdentity.mockReturnValue({
      macAddresses: ['AA:BB:CC:DD:EE:FF'],
      macSignature: 'signed-macs',
    });
  });

  it('reads the JungleSystem latest.json URL', () => {
    expect(getKolamPackageUpdateLatestUrl()).toBe(
      'https://amfibi.dunia-anura.com/desktop/jungle-system/latest.json',
    );
  });

  it('returns a parsed release with bearer, source, and MAC headers', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        appId: 'JungleSystem',
        version: '3.1.5',
        url: 'https://amfibi.dunia-anura.com/app-downloads/JungleSystem_3.1.5_x64.msix',
        sha512: VALID_SHA512,
        size: 10,
        artifact: 'JungleSystem_3.1.5_x64.msix',
      }),
    });

    await expect(fetchKolamPackageLatestRelease()).resolves.toEqual(
      expect.objectContaining({
        appId: 'JungleSystem',
        version: '3.1.5',
      }),
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://amfibi.dunia-anura.com/desktop/jungle-system/latest.json',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          Authorization: 'Bearer test-token',
          'User-Agent': appConfig.nativeUserAgent,
          'x-source': appConfig.kolamSourceHeader,
          'x-device-mac': 'AA:BB:CC:DD:EE:FF',
          'x-device-mac-signature': 'signed-macs',
        }),
      }),
    );
  });

  it('rejects when no access token is available', async () => {
    mockedGetAccessToken.mockReturnValue(undefined);

    await expect(fetchKolamPackageLatestRelease()).rejects.toMatchObject({
      status: 401,
      message: 'Login dulu',
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('maps a missing release to Tidak ada rilis', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchKolamPackageLatestRelease()).rejects.toEqual(
      expect.any(KolamPackageUpdateRequestError),
    );
    await expect(fetchKolamPackageLatestRelease()).rejects.toMatchObject({
      status: 404,
      message: 'Tidak ada rilis',
    });
  });

  it('maps forbidden responses to Akses ditolak', async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(fetchKolamPackageLatestRelease()).rejects.toMatchObject({
      status: 403,
      message: 'Akses ditolak',
    });
  });
});
