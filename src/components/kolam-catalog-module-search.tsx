import React from 'react';
import {KolamFormTextField} from './kolam-form-text-field';
import {catalogModuleStyles as styles} from './kolam-catalog-module-styles';

export function KolamCatalogModuleSearch({
  catalogSearch,
  onCatalogSearchChange,
}: {
  catalogSearch: string;
  onCatalogSearchChange: (query: string) => void;
}) {
  return (
    <KolamFormTextField
      value={catalogSearch}
      onChangeText={onCatalogSearchChange}
      mode="search"
      placeholder="cari katalog"
      style={styles.searchInput}
    />
  );
}
