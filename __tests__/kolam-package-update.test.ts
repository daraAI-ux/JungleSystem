import {
  compareKolamPublicVersion,
  isKolamPackageUpdateEmptyRelease,
  isKolamPackageUpdateNewer,
  kolamPackageUpdateErrorMessage,
  parseKolamPackageReleaseManifest,
  parseKolamPublicVersion,
} from '../src/domain/kolam-package-update';
import {KolamPackageUpdateRequestError} from '../src/services/kolam-package-update-api';

const VALID_SHA512 = 'ab'.repeat(64);
const VALID_SHA256 = 'cd'.repeat(32);

describe('kolam package update domain', () => {
  it('parses public three-digit versions and ignores the fourth MSIX digit', () => {
    expect(parseKolamPublicVersion('3.1.4')).toEqual([3, 1, 4]);
    expect(parseKolamPublicVersion('3.1.4.0')).toEqual([3, 1, 4]);
    expect(parseKolamPublicVersion(' 3.1.5 ')).toEqual([3, 1, 5]);
    expect(parseKolamPublicVersion('3.1')).toBeNull();
    expect(parseKolamPublicVersion('')).toBeNull();
  });

  it('compares public versions newest-wins', () => {
    expect(compareKolamPublicVersion('3.1.5', '3.1.4')).toBeGreaterThan(0);
    expect(compareKolamPublicVersion('3.1.4', '3.1.4.0')).toBe(0);
    expect(isKolamPackageUpdateNewer('3.1.4', '3.1.5')).toBe(true);
    expect(isKolamPackageUpdateNewer('3.1.5', '3.1.4')).toBe(false);
    expect(isKolamPackageUpdateNewer('3.1.4', '3.1.4')).toBe(false);
  });

  it('accepts a JungleSystem HTTPS release with sha512', () => {
    expect(
      parseKolamPackageReleaseManifest({
        appId: 'JungleSystem',
        version: '3.1.5',
        url: 'https://amfibi.dunia-anura.com/app-downloads/JungleSystem_3.1.5_x64.msix',
        sha512: VALID_SHA512,
        sha256: VALID_SHA256,
        size: 123,
        artifact: 'JungleSystem_3.1.5_x64.msix',
      }),
    ).toEqual(
      expect.objectContaining({
        appId: 'JungleSystem',
        version: '3.1.5',
        sha512: VALID_SHA512,
        size: 123,
      }),
    );
  });

  it('rejects non-JungleSystem, http, or hashless manifests', () => {
    expect(
      parseKolamPackageReleaseManifest({
        appId: 'KolamDA',
        version: '3.1.5',
        url: 'https://amfibi.dunia-anura.com/app-downloads/a.msix',
        sha512: VALID_SHA512,
      }),
    ).toBeNull();
    expect(
      parseKolamPackageReleaseManifest({
        appId: 'JungleSystem',
        version: '3.1.5',
        url: 'http://amfibi.dunia-anura.com/app-downloads/a.msix',
        sha512: VALID_SHA512,
      }),
    ).toBeNull();
    expect(
      parseKolamPackageReleaseManifest({
        appId: 'JungleSystem',
        version: '3.1.5',
        url: 'https://amfibi.dunia-anura.com/app-downloads/a.msix',
      }),
    ).toBeNull();
  });

  it('keeps error copy short', () => {
    expect(
      kolamPackageUpdateErrorMessage(
        new KolamPackageUpdateRequestError(404, 'Tidak ada rilis'),
      ),
    ).toBe('Tidak ada rilis');
    expect(kolamPackageUpdateErrorMessage(new Error('Hash tidak cocok'))).toBe(
      'Hash tidak cocok',
    );
    expect(kolamPackageUpdateErrorMessage(new Error('Gagal unduh'))).toBe(
      'Gagal unduh',
    );
    expect(
      kolamPackageUpdateErrorMessage(new Error('Release not found')),
    ).toBe('Tidak ada rilis');
    expect(
      kolamPackageUpdateErrorMessage(new Error('Update manifest error')),
    ).toBe('Gagal cek');
    expect(
      kolamPackageUpdateErrorMessage(
        new KolamPackageUpdateRequestError(403, 'Akses ditolak'),
      ),
    ).toBe('Akses ditolak');
    expect(kolamPackageUpdateErrorMessage(new Error('Login dulu'))).toBe(
      'Login dulu',
    );
  });

  it('maps empty-release style status copy', () => {
    expect(isKolamPackageUpdateEmptyRelease('Tidak ada rilis')).toBe(true);
    expect(isKolamPackageUpdateEmptyRelease('Terbaru')).toBe(true);
    expect(isKolamPackageUpdateEmptyRelease('Lanjut di App Installer')).toBe(
      true,
    );
    expect(isKolamPackageUpdateEmptyRelease('Gagal pasang')).toBe(false);
  });
});
