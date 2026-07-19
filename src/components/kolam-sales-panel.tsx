import React from 'react';
import type {SaleSummary} from '../domain/pos';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamSalesPanelHeader} from './kolam-sales-panel-header';
import {KolamSalesTable} from './kolam-sales-table';

export interface KolamSalesPanelProps {
  onStatusChange?: (saleId: string, status: SaleSummary['status']) => void;
  sales: SaleSummary[];
  updatingSaleId?: string | null;
}

export function KolamSalesPanel({
  onStatusChange,
  sales,
  updatingSaleId,
}: KolamSalesPanelProps) {
  return (
    <KolamCardFrame variant="salesPanel">
      <KolamSalesPanelHeader />
      <KolamSalesTable
        onStatusChange={onStatusChange}
        sales={sales}
        updatingSaleId={updatingSaleId}
      />
    </KolamCardFrame>
  );
}

export {KolamSaleAction, type KolamSaleActionProps} from './kolam-sale-action';