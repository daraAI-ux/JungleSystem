import React from 'react';
import type {CatalogItem, CheckoutState} from '../domain/pos';
import {formatRupiah} from '../lib/money';
import {KolamMetricCard} from './kolam-surface-widgets';
import {KolamListFrame} from './kolam-list-frame';

export function KolamCheckoutMetricsRow({
  catalog,
  checkout,
  finalTotal,
}: {
  catalog: CatalogItem[];
  checkout: CheckoutState;
  finalTotal: number;
}) {
  const lowStockCount = catalog.filter(
    item => item.stock <= item.lowStockThreshold,
  ).length;

  return (
    <KolamListFrame variant="dashboardMetric">
      <KolamMetricCard label="Total checkout" value={formatRupiah(finalTotal)} />
      <KolamMetricCard label="Item di cart" value={`${checkout.cart.length}`} />
      <KolamMetricCard
        label="Stok rendah"
        value={`${lowStockCount} item`}
        tone="warning"
      />
    </KolamListFrame>
  );
}
