import {
  createKolamBrandLogoDraft,
  getKolamBrandBreadcrumbPath,
  getKolamBrandFlagByCountry,
  isKolamBrandRoute,
  normalizeKolamBrandDetail,
  normalizeKolamBrandList,
  shouldSyncKolamBrandLogo,
} from '../src/domain/kolam-brand';

describe('Kolam brand domain contract', () => {
  it('uses the new Label and Fields breadcrumb paths while keeping /brands as alias', () => {
    expect(getKolamBrandBreadcrumbPath('list')).toBe('/label-dan-field/merek');
    expect(getKolamBrandBreadcrumbPath('new')).toBe(
      '/label-dan-field/merek/baru',
    );
    expect(
      getKolamBrandBreadcrumbPath('detail', {
        name: 'Dunia Anura',
        slug: 'dunia-anura',
      }),
    ).toBe('/label-dan-field/merek/Dunia Anura');
    expect(isKolamBrandRoute('/brands')).toBe(true);
    expect(isKolamBrandRoute('/label-dan-field/merek')).toBe(true);
  });

  it('normalizes backend brand counts from list and detail payloads', () => {
    expect(
      normalizeKolamBrandList({
        data: [
          {
            _id: 'brand-1',
            name: 'Kolam',
            originCountry: 'Indonesia',
            products: [{ _id: 'p1' }, { _id: 'p2' }],
            raws: [{ _id: 'r1' }],
            status: 'active',
            photos: ['media/brand-logo.png'],
          },
        ],
      }),
    ).toEqual([
      expect.objectContaining({
        id: 'brand-1',
        name: 'Kolam',
        productCount: 2,
        rawMaterialCount: 1,
        status: 'active',
        logoUrl: 'https://amfibi.dunia-anura.com/media/brand-logo.png',
      }),
    ]);

    expect(
      normalizeKolamBrandDetail({
        data: {
          _id: 'brand-1',
          name: 'Kolam',
          originCountry: 'Indonesia',
          totalProducts: 12,
          totalRaws: 7,
          status: 'blacklisted',
        },
      }),
    ).toEqual(
      expect.objectContaining({
        productCount: 12,
        rawMaterialCount: 7,
        status: 'blacklisted',
      }),
    );
  });

  it('keeps flag options local and resolves country names without backend data', () => {
    expect(getKolamBrandFlagByCountry('Indonesia')).toEqual(
      expect.objectContaining({ code: 'ID' }),
    );
    expect(getKolamBrandFlagByCountry('JP')).toEqual(
      expect.objectContaining({ code: 'JP' }),
    );
    expect(getKolamBrandFlagByCountry('Japan')).toEqual(
      expect.objectContaining({ code: 'JP' }),
    );
  });

  it('syncs logo only when local content differs and has not just failed for the same hash', () => {
    const draft = createKolamBrandLogoDraft({
      brand: { id: 'brand-1', slug: 'kolam', logoUrl: 'https://cdn/logo.jpg' },
      localUri: 'C:\\logo\\kolam.jpg',
      now: '2026-07-19T00:00:00.000Z',
    });

    expect(draft.dirty).toBe(true);
    expect(shouldSyncKolamBrandLogo(draft, 'https://cdn/logo.jpg')).toBe(true);

    expect(
      shouldSyncKolamBrandLogo({
        ...draft,
        lastAttemptHash: draft.contentHash,
      }),
    ).toBe(false);
  });
});
