import React from 'react';
import type {CatalogItem} from '../domain/pos';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamCatalogCard} from './kolam-pos-widgets';
import {KolamSellableCatalogEmpty} from './kolam-sellable-catalog-empty';

export function KolamSellableCatalogGrid({
  filteredCatalog,
  onAddToCart,
}: {
  filteredCatalog: CatalogItem[];
  onAddToCart: (item: CatalogItem) => void;
}) {
  return (
    <KolamListFrame variant="catalogGrid">
      {filteredCatalog.length ? (
        <KolamMappedList
          items={filteredCatalog}
          getKey={item => item.id}
          renderItem={item => (
            <KolamCatalogCard item={item} onPress={onAddToCart} />
          )}
        />
      ) : (
        <KolamSellableCatalogEmpty />
      )}
    </KolamListFrame>
  );
}
