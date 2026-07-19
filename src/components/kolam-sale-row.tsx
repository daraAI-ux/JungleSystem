import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {formatRupiah} from '../lib/money';
import {KolamRowFrame} from './kolam-row-frame';
import {KolamSaleActions} from './kolam-sale-actions';
import type {KolamSaleRowProps} from './kolam-sales-table';
import {salesPanelStyles as styles} from './kolam-sales-panel-styles';

export function KolamSaleRow({
  onStatusChange,
  sale,
  updatingSaleId,
}: KolamSaleRowProps) {
  return (
    <KolamRowFrame variant="sales">
      <KolamCopyStack
        containerStyle={styles.saleIdentity}
        items={[
          {id: 'code', text: sale.invoiceCode, style: styles.saleCode},
          {
            id: 'customer',
            text: sale.customerName,
            style: styles.saleCustomer,
          },
        ]}
      />
      <KolamCopyStack
        items={[{id: 'status', text: sale.status, style: styles.saleStatus}]}
      />
      <KolamCopyStack
        items={[
          {
            id: 'total',
            text: formatRupiah(sale.total),
            style: styles.saleTotal,
          },
        ]}
      />
      {onStatusChange ? (
        <KolamSaleActions
          onStatusChange={onStatusChange}
          sale={sale}
          updatingSaleId={updatingSaleId}
        />
      ) : null}
    </KolamRowFrame>
  );
}