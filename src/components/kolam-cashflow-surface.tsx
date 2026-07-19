import React from 'react';
import type {UnifiedDataset} from '../services/unified-data';
import type {KolamCashflowSurfaceProps} from './kolam-workspace-module-surface-types';
import {KolamCashflowModule} from './kolam-pos-workspace-widgets';

export function KolamCashflowSurface({
  activeSession,
  cashflow,
}: {
  activeSession: UnifiedDataset['activeSession'];
  cashflow: KolamCashflowSurfaceProps;
}) {
  return <KolamCashflowModule activeSession={activeSession} {...cashflow} />;
}
