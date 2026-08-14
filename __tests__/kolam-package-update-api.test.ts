import {
  fetchKolamPackageLatestRelease,
  getKolamPackageUpdateLatestUrl,
  KolamPackageUpdateRequestError,
} from '../src/services/kolam-package-update-api';
import {getAccessToken} from '../src/lib/api-client';

jest.mock('../src/lib/api-client', () => ({
  getAccessToken: jest.fn(),
}));

const VALID_SHA512 = 'ab'.repeat(64);
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;

describe('kolam package update api', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
    mockedGetAccessToken.mockReset();
    mockedGetAccessToken.mockReturnValue('test-token');
  });

  it('reads the JungleSystem latest.json URL', () => {
    expect(getKolamPackageUpdateLatestUrl()).toBe(
      'https://amfibi.dunia-anura.com/desktop/jungle-system/latest.json',
    );
  });

  it('returns a parsed release with a bearer token', async () => {
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
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer test-token',
        },
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
