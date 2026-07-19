import React from 'react';
import type {
  KolamCustomerList,
  KolamCustomerSurfaceProps,
} from './kolam-workspace-module-surface-types';
import {KolamCustomerModule} from './kolam-pos-workspace-widgets';

export function KolamCustomerSurface({
  customer,
  customers,
}: {
  customer: KolamCustomerSurfaceProps;
  customers: KolamCustomerList;
}) {
  return <KolamCustomerModule customers={customers} {...customer} />;
}
