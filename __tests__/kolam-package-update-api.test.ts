import {
  fetchKolamPackageLatestRelease,
  getKolamPackageUpdateLatestUrl,
  KolamPackageUpdateRequestError,
} from '../src/services/kolam-package-update-api';

const VALID_SHA512 = 'ab'.repeat(64);

describe('kolam package update api', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
  });

  it('reads the public JungleSystem latest.json URL', () => {
    expect(getKolamPackageUpdateLatestUrl()).toBe(
      'https://amfibi.dunia-anura.com/desktop/jungle-system/latest.json',
    );
  });

  it('returns a parsed release without sending a bearer token', async () => {
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
        headers: {Accept: 'application/json'},
      }),
    );
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
});
