import React from 'react';
import type {Customer} from '../domain/pos';
import {getKolamTableColumns} from '../domain/kolam-table';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCustomerTableRow} from './kolam-customer-table-row';
import {KolamDataTableHeader} from './kolam-data-table-header';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamCustomerTable({customers}: {customers: Customer[]}) {
  return (
    <KolamCardFrame variant="customerTable">
      <KolamDataTableHeader columns={getKolamTableColumns('customer')} />
      <KolamMappedList
        items={customers}
        getKey={customer => customer.id}
        renderItem={customer => <KolamCustomerTableRow customer={customer} />}
      />
    </KolamCardFrame>
  );
}