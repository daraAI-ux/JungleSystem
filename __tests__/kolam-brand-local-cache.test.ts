import {
  createKolamBrandLogoDraft,
  type KolamBrand,
} from '../src/domain/kolam-brand';
import {
  readKolamBrandDetailCache,
  readKolamBrandFromListCacheByRouteKey,
  readKolamBrandListCache,
  readKolamBrandLogoDraft,
  removeKolamBrandDetailCache,
  writeKolamBrandDetailCache,
  writeKolamBrandListCache,
  writeKolamBrandLogoDraft,
} from '../src/services/kolam-brand-local-cache';
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

describe('Kolam brand local cache', () => {
  let store: MemoryLocalDataStore;

  beforeEach(() => {
    store = new MemoryLocalDataStore();
    setLocalDataStore(store);
  });

  afterEach(() => {
    resetLocalDataStore();
  });

  it('persists the brand list only when the revision changes', async () => {
    const brands: KolamBrand[] = [
      {
        id: 'brand-1',
        name: 'Kolam',
        slug: 'kolam',
        description: '',
        originCountry: 'Indonesia',
        status: 'active',
        notes: '',
        links: [],
        photos: [],
        logoUrl: null,
        productCount: 2,
        rawMaterialCount: 1,
        serviceCount: 0,
        speciesCount: 0,
        raw: {},
      },
    ];

    await expect(writeKolamBrandListCache(brands)).resolves.toBe(true);
    await expect(writeKolamBrandListCache(brands)).resolves.toBe(false);
    await expect(readKolamBrandListCache()).resolves.toEqual(
      expect.objectContaining({
        value: brands,
      }),
    );
  });

  it('stores logo metadata without storing binary content in SQLite', async () => {
    const draft = createKolamBrandLogoDraft({
      brand: { id: 'brand-1', slug: 'kolam', logoUrl: null },
      localUri: 'C:\\logos\\kolam.png',
      now: '2026-07-19T00:00:00.000Z',
    });

    await expect(writeKolamBrandLogoDraft(draft)).resolves.toBe(true);
    await expect(writeKolamBrandLogoDraft(draft)).resolves.toBe(false);
    await expect(readKolamBrandLogoDraft('brand-1')).resolves.toEqual(
      expect.objectContaining({
        value: expect.objectContaining({
          localUri: 'C:\\logos\\kolam.png',
          syncState: 'pending',
        }),
      }),
    );
  });

  it('resolves brand detail routes from the local list by name, slug, or id', async () => {
    const brands: KolamBrand[] = [
      {
        id: 'brand-1',
        name: 'Amidis',
        slug: 'amidis',
        description: '',
        originCountry: 'Indonesia',
        status: 'active',
        notes: '',
        links: [],
        photos: [],
        logoUrl: 'https://cdn/amidis.png',
        productCount: 41,
        rawMaterialCount: 7,
        serviceCount: 0,
        speciesCount: 0,
        raw: {},
      },
    ];

    await writeKolamBrandListCache(brands);

    await expect(
      readKolamBrandFromListCacheByRouteKey('Amidis'),
    ).resolves.toEqual(expect.objectContaining({ id: 'brand-1' }));
    await expect(
      readKolamBrandFromListCacheByRouteKey('amidis'),
    ).resolves.toEqual(expect.objectContaining({ id: 'brand-1' }));
    await expect(
      readKolamBrandFromListCacheByRouteKey('brand-1'),
    ).resolves.toEqual(expect.objectContaining({ id: 'brand-1' }));
  });

  it('removes brand detail and logo metadata cache together', async () => {
    const brand: KolamBrand = {
      id: 'brand-1',
      name: 'Kolam',
      slug: 'kolam',
      description: '',
      originCountry: 'Indonesia',
      status: 'active',
      notes: '',
      links: [],
      photos: [],
      logoUrl: null,
      productCount: 2,
      rawMaterialCount: 1,
      serviceCount: 0,
      speciesCount: 0,
      raw: {},
    };
    const draft = createKolamBrandLogoDraft({
      brand,
      localUri: 'C:\\logos\\kolam.png',
      now: '2026-07-19T00:00:00.000Z',
    });

    await writeKolamBrandDetailCache(brand);
    await writeKolamBrandLogoDraft(draft);
    await removeKolamBrandDetailCache('brand-1');

    await expect(readKolamBrandDetailCache('brand-1')).resolves.toBeNull();
    await expect(readKolamBrandLogoDraft('brand-1')).resolves.toBeNull();
  });
});
