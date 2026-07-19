import {
  getCountryFlagIcon,
  getCountryFlagImageUrl,
  getKolamCountryFlagByCountry,
  KOLAM_COUNTRY_FLAG_OPTIONS,
} from '../src/domain/kolam-country-flags';

describe('Kolam country flag set', () => {
  it('keeps a built-in world flag option set in the app', () => {
    expect(KOLAM_COUNTRY_FLAG_OPTIONS.length).toBeGreaterThanOrEqual(240);
    expect(KOLAM_COUNTRY_FLAG_OPTIONS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'ID' }),
        expect.objectContaining({ code: 'US' }),
        expect.objectContaining({ code: 'JP' }),
        expect.objectContaining({ code: 'BR' }),
      ]),
    );
  });

  it('builds local flag metadata and image URLs from ISO country codes', () => {
    expect(getCountryFlagIcon('ID')).not.toBe('ID');
    expect(getCountryFlagImageUrl('ID')).toEqual(
      expect.stringContaining('data:image/svg+xml;utf8,'),
    );
    expect(decodeURIComponent(getCountryFlagImageUrl('ID'))).toEqual(
      expect.stringContaining('#ef4444'),
    );
    expect(getKolamCountryFlagByCountry('ID')).toEqual(
      expect.objectContaining({
        code: 'ID',
        imageUrl: expect.stringContaining('data:image/svg+xml;utf8,'),
      }),
    );
    expect(getKolamCountryFlagByCountry('Japan')).toEqual(
      expect.objectContaining({
        code: 'JP',
        imageUrl: expect.stringContaining('data:image/svg+xml;utf8,'),
      }),
    );
    expect(getKolamCountryFlagByCountry('United States')).toEqual(
      expect.objectContaining({
        code: 'US',
        imageUrl: expect.stringContaining('data:image/svg+xml;utf8,'),
      }),
    );
    expect(getKolamCountryFlagByCountry('Negara Tidak Ada')).toEqual(
      expect.objectContaining({
        code: '',
        imageUrl: null,
      }),
    );
  });
});
