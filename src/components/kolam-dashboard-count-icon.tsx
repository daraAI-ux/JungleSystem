import React from 'react';
import type {DashboardCountIconKind} from '../domain/dashboard-counts';
import {KolamDashboardLifeStockCountIcon} from './kolam-dashboard-life-stock-count-icon';
import {KolamDashboardProductCountIcon} from './kolam-dashboard-product-count-icon';
import {KolamDashboardRawMaterialCountIcon} from './kolam-dashboard-raw-material-count-icon';
import {KolamDashboardServiceCountIcon} from './kolam-dashboard-service-count-icon';

export interface KolamDashboardCountIconProps {
  kind: DashboardCountIconKind;
}

export function KolamDashboardCountIcon({
  kind,
}: KolamDashboardCountIconProps) {
  if (kind === 'shopping-bag') {
    return <KolamDashboardProductCountIcon />;
  }

  if (kind === 'package') {
    return <KolamDashboardRawMaterialCountIcon />;
  }

  if (kind === 'book') {
    return <KolamDashboardLifeStockCountIcon />;
  }

  return <KolamDashboardServiceCountIcon />;
}
