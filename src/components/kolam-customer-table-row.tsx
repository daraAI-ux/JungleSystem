import React from 'react';
import type {Customer} from '../domain/pos';
import {KolamDataTablePrimaryCell} from './kolam-data-table-primary-cell';
import {KolamDataTableRowFrame} from './kolam-data-table-row-frame';
import {
  KolamDataTableAmountCell,
  KolamDataTableMetaCell,
} from './kolam-data-table-text-cell';

export function KolamCustomerTableRow({customer}: {customer: Customer}) {
  return (
    <KolamDataTableRowFrame>
      <KolamDataTablePrimaryCell
        title={customer.name}
        subtitle={customer.address}
      />
      <KolamDataTableMetaCell>{customer.phone}</KolamDataTableMetaCell>
      <KolamDataTableAmountCell>{customer.email}</KolamDataTableAmountCell>
    </KolamDataTableRowFrame>
  );
}
