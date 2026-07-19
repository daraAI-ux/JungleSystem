import React from 'react';
import type {StatusPanelDescriptor} from '../domain/status-panel';
import {KolamPanelFrame} from './kolam-panel-frame';
import {KolamStatusPanelBody} from './kolam-status-panel-body';
import {KolamStatusPanelHeader} from './kolam-status-panel-header';

export function KolamStatusPanelFrame({
  panel,
  meta,
  children,
}: {
  panel: StatusPanelDescriptor;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <KolamPanelFrame variant="status">
      <KolamStatusPanelHeader panel={panel} meta={meta} />
      <KolamStatusPanelBody>{children}</KolamStatusPanelBody>
    </KolamPanelFrame>
  );
}