import React from 'react';
import type {CatalogItem} from '../domain/pos';
import {formatRupiah} from '../lib/money';
import {KolamCatalogTableItemInfo} from './kolam-catalog-table-item-info';
import {KolamDataTableRowFrame} from './kolam-data-table-row-frame';
import {
  KolamDataTableAmountCell,
  KolamDataTableMetaCell,
} from './kolam-data-table-text-cell';

export function KolamCatalogTableRow({item}: {item: CatalogItem}) {
  return (
    <KolamDataTableRowFrame>
      <KolamCatalogTableItemInfo item={item} />
      <KolamDataTableMetaCell>{item.stock} stok</KolamDataTableMetaCell>
      <KolamDataTableAmountCell>
        {formatRupiah(item.price)}
      </KolamDataTableAmountCell>
    </KolamDataTableRowFrame>
  );
}
