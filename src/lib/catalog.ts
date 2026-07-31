import type {CatalogItem, CatalogItemType} from '../domain/pos';

export type CatalogFilterType = 'all' | CatalogItemType;

export interface CatalogFilter {
  category?: string | null;
  type: CatalogFilterType;
  search: string;
}

export function filterCatalogItems(
  items: CatalogItem[],
  filter: CatalogFilter,
): CatalogItem[] {
  const query = filter.search.trim().toLowerCase();

  return items.filter(item => {
    const typeMatches = filter.type === 'all' || item.type === filter.type;
    const categoryMatches =
      !filter.category ||
      item.category.trim().toLowerCase() === filter.category.trim().toLowerCase();

    if (!typeMatches) {
      return false;
    }

    if (!categoryMatches) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [item.name, item.code, item.category, ...item.labels]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}
