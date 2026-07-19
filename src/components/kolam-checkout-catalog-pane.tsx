import React from 'react';
import type {CatalogItem, CatalogItemType} from '../domain/pos';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamSellableCatalogPicker} from './kolam-sellable-catalog-picker';

export function KolamCheckoutCatalogPane({
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
    <KolamContentFrame variant="checkoutCatalogPane">
      <KolamSellableCatalogPicker
        activeType={activeType}
        catalogSearch={catalogSearch}
        filteredCatalog={filteredCatalog}
        onAddToCart={onAddToCart}
        onCatalogSearchChange={onCatalogSearchChange}
        onTypeChange={onTypeChange}
      />
    </KolamContentFrame>
  );
}