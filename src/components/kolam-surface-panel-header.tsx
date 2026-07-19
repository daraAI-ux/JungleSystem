import React from 'react';
import type {KolamSurfacePanelTab} from './kolam-surface-panel-types';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamSurfacePanelCopy} from './kolam-surface-panel-copy';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

export function KolamSurfacePanelHeader<TabId extends string = string>({
  description,
  onSelectTab,
  selectedTabId,
  tabs,
  title,
}: {
  description: string;
  onSelectTab: (tabId: TabId) => void;
  selectedTabId: TabId;
  tabs: KolamSurfacePanelTab<TabId>[];
  title: string;
}) {
  return (
    <KolamHeaderFrame variant="surfacePanel">
      <KolamSurfacePanelCopy title={title} description={description} />
      <KolamSurfacePanelTabs
        onSelectTab={onSelectTab}
        selectedTabId={selectedTabId}
        tabs={tabs}
      />
    </KolamHeaderFrame>
  );
}