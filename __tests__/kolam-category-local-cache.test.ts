import type { KolamCategory } from '../src/domain/kolam-category';
import {
  readKolamCategoryFromListCacheByRouteKey,
  readKolamCategoryListCache,
  writeKolamCategoryListCache,
} from '../src/services/kolam-category-local-cache';
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';

describe('Kolam category local cache', () => {
  beforeEach(() => {
    setLocalDataStore(new MemoryLocalDataStore());
  });

  afterEach(() => {
    resetLocalDataStore();
  });

  it('stores category tree snapshots and resolves detail routes locally', async () => {
    const categories: KolamCategory[] = [
      {
        id: 'cat-1',
        name: 'Peralatan',
        slug: 'peralatan',
        description: '',
        translations: {},
        iconUrl: 'https://cdn/peralatan.png',
        photos: [],
        productCount: 2,
        serviceCount: 0,
        speciesCount: 1,
        customFieldCount: 0,
        childrenCount: 1,
        parentId: null,
        parentName: null,
        level: 0,
        showInMarketplace: true,
        marketplaceOrder: 1,
        status: 'active',
        children: [
          {
            id: 'cat-2',
            name: 'Filter',
            slug: 'filter',
            description: '',
            translations: {},
            iconUrl: null,
            photos: [],
            productCount: 1,
            serviceCount: 0,
            speciesCount: 0,
            customFieldCount: 0,
            childrenCount: 0,
            parentId: 'cat-1',
            parentName: 'Peralatan',
            level: 1,
            showInMarketplace: false,
            marketplaceOrder: 0,
            status: 'active',
            children: [],
            raw: {},
          },
        ],
        raw: {},
      },
    ];

    await expect(writeKolamCategoryListCache(categories)).resolves.toBe(true);
    await expect(writeKolamCategoryListCache(categories)).resolves.toBe(false);
    await expect(readKolamCategoryListCache()).resolves.toEqual(
      expect.objectContaining({ value: categories }),
    );
    await expect(
      readKolamCategoryFromListCacheByRouteKey('Filter'),
    ).resolves.toEqual(expect.objectContaining({ id: 'cat-2' }));
  });
});
