import {
  createKolamCategorySavePayload,
  filterKolamCategoryTree,
  flattenAllCategories,
  normalizeKolamCategoryList,
} from '../src/domain/kolam-category';

describe('Kolam category domain contract', () => {
  it('normalizes backend category tree with icon and live counts', () => {
    const categories = normalizeKolamCategoryList({
      data: [
        {
          _id: 'cat-1',
          name: 'Peralatan',
          description: 'Kategori peralatan',
          icon: 'media/category/peralatan.png',
          totalProducts: 12,
          totalLifeStock: 3,
          children: [
            {
              _id: 'cat-2',
              name: 'Filter',
              parent: { _id: 'cat-1', name: 'Peralatan' },
              level: 1,
            },
          ],
          showInMarketplace: true,
          marketplaceOrder: 4,
        },
      ],
    });

    expect(categories[0]).toEqual(
      expect.objectContaining({
        id: 'cat-1',
        iconUrl: 'https://amfibi.dunia-anura.com/media/category/peralatan.png',
        productCount: 12,
        speciesCount: 3,
        showInMarketplace: true,
      }),
    );
    expect(categories[0].children[0]).toEqual(
      expect.objectContaining({
        parentId: 'cat-1',
        parentName: 'Peralatan',
      }),
    );
  });

  it('filters and flattens category trees without losing matched children', () => {
    const categories = normalizeKolamCategoryList({
      data: [
        {
          _id: 'cat-1',
          name: 'Peralatan',
          children: [{ _id: 'cat-2', name: 'Filter Canister' }],
        },
      ],
    });

    expect(
      flattenAllCategories(categories).map(category => category.name),
    ).toEqual(['Peralatan', 'Filter Canister']);
    expect(filterKolamCategoryTree(categories, 'canister')[0].children).toEqual(
      [expect.objectContaining({ name: 'Filter Canister' })],
    );
  });

  it('builds backend payload with explicit marketplace visibility and order', () => {
    expect(
      createKolamCategorySavePayload({
        name: ' Aquascape ',
        description: 'Display marketplace',
        parentId: '',
        iconLocalUri: '',
        iconRemoteUrl: '',
        showInMarketplace: true,
        marketplaceOrder: '7',
      }),
    ).toEqual({
      name: 'Aquascape',
      description: 'Display marketplace',
      parent: null,
      showInMarketplace: true,
      marketplaceOrder: 7,
    });
  });
});
