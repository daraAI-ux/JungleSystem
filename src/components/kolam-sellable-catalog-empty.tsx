import React from 'react';
import {KolamEmptyState} from './kolam-empty-state';

export function KolamSellableCatalogEmpty() {
  return (
    <KolamEmptyState
      title="Katalog tidak ditemukan"
      message="Coba kata kunci lain atau ganti filter product/species."
    />
  );
}
