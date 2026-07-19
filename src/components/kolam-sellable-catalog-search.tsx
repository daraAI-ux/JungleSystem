import React from 'react';
import {KolamFormTextField} from './kolam-form-text-field';
import {sellableCatalogPickerStyles as styles} from './kolam-sellable-catalog-picker-styles';

export function KolamSellableCatalogSearch({
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
      placeholder="cari nama, kode, kategori, label"
      style={styles.searchInput}
    />
  );
}
