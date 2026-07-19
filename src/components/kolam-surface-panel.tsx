import React from 'react';
import {KolamPanelFrame} from './kolam-panel-frame';
import {KolamSurfacePanelHeader} from './kolam-surface-panel-header';
import {
  type KolamSurfacePanelProps,
  type KolamSurfacePanelTab,
} from './kolam-surface-panel-types';

export type {KolamSurfacePanelProps, KolamSurfacePanelTab};

export function KolamSurfacePanel<TabId extends string = string>({
  children,
  description,
  onSelectTab,
  selectedTabId,
  tabs,
  title,
}: KolamSurfacePanelProps<TabId>) {
  return (
    <KolamPanelFrame variant="surface">
      <KolamSurfacePanelHeader
        description={description}
        onSelectTab={onSelectTab}
        selectedTabId={selectedTabId}
        tabs={tabs}
        title={title}
      />
      {children}
    </KolamPanelFrame>
  );
}