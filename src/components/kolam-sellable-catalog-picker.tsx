import React from 'react';
import type {CatalogItem, CatalogItemType} from '../domain/pos';
import {KolamSellableCatalogGrid} from './kolam-sellable-catalog-grid';
import {KolamSellableCatalogHeader} from './kolam-sellable-catalog-header';
import {KolamSellableCatalogSearch} from './kolam-sellable-catalog-search';
import {KolamSellableCatalogTypeTabs} from './kolam-sellable-catalog-type-tabs';

export function KolamSellableCatalogPicker({
  activeType,
  catalogSearch,
  filteredCatalog,
  onAddToCart,
  onCatalogSearchChange,
  onTypeChange,
}: {
  activeType: CatalogItemType | 'all';
  catalogSearch: string;
  filteredCatalog: CatalogItem[];
  onAddToCart: (item: CatalogItem) => void;
  onCatalogSearchChange: (query: string) => void;
  onTypeChange: (type: CatalogItemType | 'all') => void;
}) {
  return (
    <>
      <KolamSellableCatalogHeader />
      <KolamSellableCatalogTypeTabs
        activeType={activeType}
        onTypeChange={onTypeChange}
      />
      <KolamSellableCatalogSearch
        catalogSearch={catalogSearch}
        onCatalogSearchChange={onCatalogSearchChange}
      />
      <KolamSellableCatalogGrid
        filteredCatalog={filteredCatalog}
        onAddToCart={onAddToCart}
      />
    </>
  );
}
