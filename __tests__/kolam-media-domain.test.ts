import {
  createKolamMediaRoute,
  isKolamMediaRoute,
  parseKolamMediaRoute,
} from '../src/domain/kolam-media';

describe('Kolam media route helpers', () => {
  it('detects the native media route without treating children as media', () => {
    expect(isKolamMediaRoute('/media')).toBe(true);
    expect(isKolamMediaRoute('/media?filter=orphan&type=video')).toBe(true);
    expect(isKolamMediaRoute('/media-library')).toBe(false);
  });

  it('parses FE live media query params with safe defaults', () => {
    expect(
      parseKolamMediaRoute('/media?filter=orphan&type=video&page=3&search=frog'),
    ).toEqual({
      filter: 'orphan',
      page: 3,
      search: 'frog',
      type: 'video',
    });
    expect(parseKolamMediaRoute('/media?filter=unknown&page=-1')).toEqual({
      filter: 'all',
      page: 1,
      search: '',
      type: 'image',
    });
  });

  it('creates compact routes that match the live media links', () => {
    expect(createKolamMediaRoute({})).toBe('/media');
    expect(createKolamMediaRoute({filter: 'orphan', type: 'image'})).toBe(
      '/media?filter=orphan',
    );
    expect(
      createKolamMediaRoute({
        filter: 'orphan',
        page: 2,
        search: 'proof',
        type: 'video',
      }),
    ).toBe('/media?type=video&filter=orphan&page=2&search=proof');
  });
});

