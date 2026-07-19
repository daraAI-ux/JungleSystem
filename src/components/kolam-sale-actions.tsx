import React from 'react';
import type {SaleSummary} from '../domain/pos';
import {canMoveSaleStatus} from '../lib/workflow';
import {KolamListFrame} from './kolam-list-frame';
import {KolamSaleAction} from './kolam-sale-action';

export function KolamSaleActions({
  onStatusChange,
  sale,
  updatingSaleId,
}: {
  onStatusChange: (saleId: string, status: SaleSummary['status']) => void;
  sale: SaleSummary;
  updatingSaleId?: string | null;
}) {
  return (
    <KolamListFrame variant="saleActions">
      <KolamSaleStatusAction
        label="Sent"
        nextStatus="sent"
        onStatusChange={onStatusChange}
        sale={sale}
        updatingSaleId={updatingSaleId}
      />
      <KolamSaleStatusAction
        label="Paid"
        nextStatus="paid"
        onStatusChange={onStatusChange}
        sale={sale}
        updatingSaleId={updatingSaleId}
      />
      <KolamSaleStatusAction
        label="Cancel"
        nextStatus="cancelled"
        onStatusChange={onStatusChange}
        sale={sale}
        updatingSaleId={updatingSaleId}
      />
    </KolamListFrame>
  );
}

function KolamSaleStatusAction({
  label,
  nextStatus,
  onStatusChange,
  sale,
  updatingSaleId,
}: {
  label: string;
  nextStatus: SaleSummary['status'];
  onStatusChange: (saleId: string, status: SaleSummary['status']) => void;
  sale: SaleSummary;
  updatingSaleId?: string | null;
}) {
  return (
    <KolamSaleAction
      label={label}
      disabled={
        !canMoveSaleStatus(sale.status, nextStatus) ||
        updatingSaleId === sale.id
      }
      onPress={() => onStatusChange(sale.id, nextStatus)}
    />
  );
}