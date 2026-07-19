import React from 'react';
import type {CatalogItem} from '../domain/pos';
import {getKolamTableColumns} from '../domain/kolam-table';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCatalogTableRow} from './kolam-catalog-table-row';
import {KolamDataTableHeader} from './kolam-data-table-header';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamCatalogTable({
  filteredCatalog,
}: {
  filteredCatalog: CatalogItem[];
}) {
  return (
    <KolamCardFrame variant="catalogTable">
      <KolamDataTableHeader columns={getKolamTableColumns('catalog')} />
      <KolamMappedList
        items={filteredCatalog}
        getKey={item => item.id}
        renderItem={item => <KolamCatalogTableRow item={item} />}
      />
    </KolamCardFrame>
  );
}