import {catalogItems} from '../src/data/seed';
import {filterCatalogItems} from '../src/lib/catalog';

test('filters catalog by item type', () => {
  const species = filterCatalogItems(catalogItems, {
    type: 'species',
    search: '',
  });

  expect(species).toHaveLength(2);
  expect(species.every(item => item.type === 'species')).toBe(true);
});

test('searches catalog by name code category and labels', () => {
  expect(
    filterCatalogItems(catalogItems, {type: 'all', search: 'BTA'}),
  ).toHaveLength(1);

  expect(
    filterCatalogItems(catalogItems, {type: 'all', search: 'water care'}),
  ).toHaveLength(1);

  expect(
    filterCatalogItems(catalogItems, {type: 'all', search: 'live-stock'}),
  ).toHaveLength(2);
});

