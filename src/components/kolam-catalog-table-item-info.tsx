import React from 'react';
import type {CatalogItem} from '../domain/pos';
import {KolamDataTablePrimaryCell} from './kolam-data-table-primary-cell';

export function KolamCatalogTableItemInfo({item}: {item: CatalogItem}) {
  return (
    <KolamDataTablePrimaryCell
      title={item.name}
      subtitle={`${item.type} - ${item.code} - ${item.category}`}
    />
  );
}
