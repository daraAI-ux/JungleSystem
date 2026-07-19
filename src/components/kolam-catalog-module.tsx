import React from 'react';
import type {CatalogItem} from '../domain/pos';
import {KolamModulePanel} from './kolam-surface-widgets';
import {KolamCatalogModuleSearch} from './kolam-catalog-module-search';
import {KolamCatalogTable} from './kolam-catalog-table';

export function KolamCatalogModule({
  catalogSearch,
  filteredCatalog,
  onCatalogSearchChange,
}: {
  catalogSearch: string;
  filteredCatalog: CatalogItem[];
  onCatalogSearchChange: (query: string) => void;
}) {
  return (
    <KolamModulePanel
      title="Katalog"
      hint="Daftar sellable product dan species yang akan dipakai kasir.">
      <KolamCatalogModuleSearch
        catalogSearch={catalogSearch}
        onCatalogSearchChange={onCatalogSearchChange}
      />
      <KolamCatalogTable filteredCatalog={filteredCatalog} />
    </KolamModulePanel>
  );
}
