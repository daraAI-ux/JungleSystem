import {
  formatKolamAppDownloadFileSize,
  getKolamAppDownloadPlatformLabel,
  isKolamAppDownloadRoute,
} from '../src/domain/kolam-app-download';

describe('kolam app download domain', () => {
  it('detects app download routes', () => {
    expect(isKolamAppDownloadRoute('/app-downloads')).toBe(true);
    expect(isKolamAppDownloadRoute('/app-downloads?tab=download')).toBe(true);
    expect(isKolamAppDownloadRoute('/media')).toBe(false);
  });

  it('formats artifact file sizes', () => {
    expect(formatKolamAppDownloadFileSize(0)).toBe('-');
    expect(formatKolamAppDownloadFileSize(1024)).toBe('1.0 KB');
    expect(formatKolamAppDownloadFileSize(1536 * 1024)).toBe('1.5 MB');
  });

  it('labels supported platforms', () => {
    expect(getKolamAppDownloadPlatformLabel('windows')).toBe('Windows');
    expect(getKolamAppDownloadPlatformLabel('mac')).toBe('macOS');
    expect(getKolamAppDownloadPlatformLabel('other')).toBe('Lainnya');
  });
});
