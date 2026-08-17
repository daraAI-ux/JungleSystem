import {
  checkKolamPackageUpdate,
  getKolamPackageUpdateState,
  installKolamPackageUpdate,
  resetKolamPackageUpdateStoreForTests,
  startKolamPackageUpdateAutoCheck,
} from '../src/domain/kolam-package-update-store';
import {getAccessToken} from '../src/lib/api-client';
import {fetchKolamPackageLatestRelease} from '../src/services/kolam-package-update-api';
import {
  downloadKolamWindowsMsix,
  installKolamWindowsMsix,
  readKolamWindowsPackageInfo,
  restartKolamWindowsApp,
} from '../src/services/kolam-windows-package-update';

jest.mock('../src/lib/api-client', () => ({
  getAccessToken: jest.fn(() => 'test-token'),
}));

jest.mock('../src/services/kolam-package-update-api', () => ({
  fetchKolamPackageLatestRelease: jest.fn(),
}));

jest.mock('../src/services/kolam-windows-package-update', () => ({
  downloadKolamWindowsMsix: jest.fn(),
  getKolamWindowsPackageInfo: jest.fn(),
  readKolamWindowsPackageInfo: jest.fn(),
  installKolamWindowsMsix: jest.fn(),
  restartKolamWindowsApp: jest.fn(),
  subscribeKolamWindowsPackageUpdateProgress: () => () => undefined,
}));

const mockedFetch = fetchKolamPackageLatestRelease as jest.MockedFunction<
  typeof fetchKolamPackageLatestRelease
>;
const mockedInfo = readKolamWindowsPackageInfo as jest.MockedFunction<
  typeof readKolamWindowsPackageInfo
>;
const mockedDownload = downloadKolamWindowsMsix as jest.MockedFunction<
  typeof downloadKolamWindowsMsix
>;
const mockedInstall = installKolamWindowsMsix as jest.MockedFunction<
  typeof installKolamWindowsMsix
>;
const mockedRestart = restartKolamWindowsApp as jest.MockedFunction<
  typeof restartKolamWindowsApp
>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<
  typeof getAccessToken
>;

const RELEASE = {
  appId: 'JungleSystem',
  version: '3.1.5',
  url: 'https://amfibi.dunia-anura.com/app-downloads/JungleSystem_3.1.5_x64.msix',
  sha512: 'ab'.repeat(64),
  size: 10,
  artifact: 'JungleSystem_3.1.5_x64.msix',
};

describe('kolam package update store', () => {
  beforeEach(() => {
    resetKolamPackageUpdateStoreForTests();
    mockedFetch.mockReset();
    mockedInfo.mockReset();
    mockedDownload.mockReset();
    mockedInstall.mockReset();
    mockedRestart.mockReset();
    mockedGetAccessToken.mockReset();
    mockedGetAccessToken.mockReturnValue('test-token');
    mockedInfo.mockResolvedValue({
      familyName: 'JungleSystem_test',
      name: 'JungleSystem',
      packaged: true,
      publicVersion: '3.1.4',
      publisher: 'CN=user',
      version: '3.1.4.0',
    });
  });

  it('stays idle when auto-check finds the same version', async () => {
    mockedFetch.mockResolvedValue({
      ...RELEASE,
      version: '3.1.4',
    });

    await startKolamPackageUpdateAutoCheck();

    expect(getKolamPackageUpdateState()).toEqual(
      expect.objectContaining({
        currentVersion: '3.1.4',
        phase: 'idle',
        release: null,
        errorMessage: '',
      }),
    );
  });

  it('keeps auto-check errors silent', async () => {
    mockedFetch.mockRejectedValue(new Error('Gagal cek'));

    await startKolamPackageUpdateAutoCheck();

    expect(getKolamPackageUpdateState().phase).toBe('idle');
    expect(getKolamPackageUpdateState().errorMessage).toBe('');
  });

  it('marks a newer release available after a manual check', async () => {
    mockedFetch.mockResolvedValue(RELEASE);

    await checkKolamPackageUpdate({silent: false});

    expect(getKolamPackageUpdateState()).toEqual(
      expect.objectContaining({
        phase: 'available',
        release: expect.objectContaining({version: '3.1.5'}),
        errorMessage: '',
      }),
    );
  });

  it('reports Terbaru when manual check finds the same version', async () => {
    mockedFetch.mockResolvedValue({
      ...RELEASE,
      version: '3.1.4',
    });

    await checkKolamPackageUpdate({silent: false});

    expect(getKolamPackageUpdateState()).toEqual(
      expect.objectContaining({
        phase: 'idle',
        release: null,
        errorMessage: 'Terbaru',
      }),
    );
  });

  it('reports Paket tidak terdeteksi when unpackaged', async () => {
    mockedInfo.mockResolvedValue({
      familyName: '',
      name: 'JungleSystem',
      packaged: false,
      publicVersion: '',
      publisher: '',
      version: '',
    });

    await checkKolamPackageUpdate({silent: false});

    expect(getKolamPackageUpdateState()).toEqual(
      expect.objectContaining({
        phase: 'error',
        release: null,
        errorMessage: 'Paket tidak terdeteksi',
      }),
    );
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('does not install until Pasang is invoked', async () => {
    mockedFetch.mockResolvedValue(RELEASE);
    await checkKolamPackageUpdate({silent: false});

    expect(mockedDownload).not.toHaveBeenCalled();
    expect(mockedInstall).not.toHaveBeenCalled();
  });

  it('downloads, installs, then restarts only from Pasang', async () => {
    mockedFetch.mockResolvedValue(RELEASE);
    mockedDownload.mockResolvedValue({path: 'C:\\cache\\update.msix'});
    mockedInstall.mockResolvedValue({ok: true});
    mockedRestart.mockResolvedValue(undefined);

    await checkKolamPackageUpdate({silent: false});
    await installKolamPackageUpdate();

    expect(mockedDownload).toHaveBeenCalledWith(
      expect.objectContaining({
        url: RELEASE.url,
        sha512: RELEASE.sha512,
        authorization: 'Bearer test-token',
      }),
    );
    expect(mockedInstall).toHaveBeenCalledWith('C:\\cache\\update.msix');
    expect(mockedRestart).toHaveBeenCalled();
  });

  it('skips JS restart when native already relaunches after install', async () => {
    mockedFetch.mockResolvedValue(RELEASE);
    mockedDownload.mockResolvedValue({path: 'C:\\cache\\update.msix'});
    mockedInstall.mockResolvedValue({ok: true, restarting: true});

    await checkKolamPackageUpdate({silent: false});
    await installKolamPackageUpdate();

    expect(mockedRestart).not.toHaveBeenCalled();
    expect(getKolamPackageUpdateState()).toEqual(
      expect.objectContaining({
        phase: 'idle',
        percent: 100,
        errorMessage: '',
      }),
    );
  });

  it('surfaces install failure instead of App Installer fallback', async () => {
    mockedFetch.mockResolvedValue(RELEASE);
    mockedDownload.mockResolvedValue({path: 'C:\\cache\\update.msix'});
    mockedInstall.mockRejectedValue(new Error('Gagal pasang'));

    await checkKolamPackageUpdate({silent: false});
    await installKolamPackageUpdate();

    expect(mockedRestart).not.toHaveBeenCalled();
    expect(getKolamPackageUpdateState()).toEqual(
      expect.objectContaining({
        phase: 'error',
        errorMessage: 'Gagal pasang',
      }),
    );
  });

  it('does not install when the app is unpackaged', async () => {
    mockedInfo.mockResolvedValue({
      familyName: '',
      name: 'JungleSystem',
      packaged: false,
      publicVersion: '3.1.4',
      publisher: '',
      version: '',
    });
    mockedFetch.mockResolvedValue(RELEASE);
    await checkKolamPackageUpdate({silent: false});
    await installKolamPackageUpdate();

    expect(mockedDownload).not.toHaveBeenCalled();
  });
});
