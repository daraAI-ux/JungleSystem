import React from 'react';
import type {KolamSalesSurfaceProps} from './kolam-workspace-module-surface-types';
import {KolamSalesPanel} from './kolam-pos-widgets';

export function KolamSalesSurface({sales}: {sales: KolamSalesSurfaceProps}) {
  return <KolamSalesPanel {...sales} />;
}
