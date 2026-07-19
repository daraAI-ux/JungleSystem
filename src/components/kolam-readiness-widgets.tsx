import React from 'react';
import type {ReadinessCheck} from '../domain/readiness';
import {getStatusPanelDescriptor} from '../domain/status-panel';
import {KolamReadinessGrid} from './kolam-readiness-grid';
import {KolamStatusPanelFrame} from './kolam-status-panel-frame';

export function KolamReadinessPanel({
  checks,
  summaryText,
}: {
  checks: ReadinessCheck[];
  summaryText: string;
}) {
  return (
    <KolamStatusPanelFrame
      panel={getStatusPanelDescriptor('readiness')}
      meta={summaryText}>
      <KolamReadinessGrid checks={checks} />
    </KolamStatusPanelFrame>
  );
}
