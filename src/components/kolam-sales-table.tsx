import React from 'react';
import type {SaleSummary} from '../domain/pos';
import {getKolamTableColumns} from '../domain/kolam-table';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamDataTableHeader} from './kolam-data-table-header';
import {KolamMappedList} from './kolam-mapped-list';
import type {KolamSalesPanelProps} from './kolam-sales-panel';
import {KolamSaleRow} from './kolam-sale-row';

export function KolamSalesTable({
  onStatusChange,
  sales,
  updatingSaleId,
}: KolamSalesPanelProps) {
  return (
    <KolamCardFrame variant="salesTable">
      <KolamDataTableHeader
        columns={getKolamTableColumns('sales').filter(
          column => onStatusChange || column.id !== 'actions',
        )}
      />
      <KolamMappedList
        items={sales}
        getKey={sale => sale.id}
        renderItem={sale => (
          <KolamSaleRow
            onStatusChange={onStatusChange}
            sale={sale}
            updatingSaleId={updatingSaleId}
          />
        )}
      />
    </KolamCardFrame>
  );
}

export interface KolamSaleRowProps {
  onStatusChange?: (saleId: string, status: SaleSummary['status']) => void;
  sale: SaleSummary;
  updatingSaleId?: string | null;
}