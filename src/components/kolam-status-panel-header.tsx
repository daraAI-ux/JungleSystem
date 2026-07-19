import React from 'react';
import type {StatusPanelDescriptor} from '../domain/status-panel';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamStatusPanelMeta} from './kolam-status-panel-meta';
import {KolamStatusPanelTitleRow} from './kolam-status-panel-title-row';

export function KolamStatusPanelHeader({
  panel,
  meta,
}: {
  panel: StatusPanelDescriptor;
  meta: string;
}) {
  return (
    <KolamHeaderFrame variant="statusPanel">
      <KolamStatusPanelTitleRow panel={panel} />
      <KolamStatusPanelMeta meta={meta} />
    </KolamHeaderFrame>
  );
}