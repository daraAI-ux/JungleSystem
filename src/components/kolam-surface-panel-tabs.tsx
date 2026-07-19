import React from 'react';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import type {KolamSurfacePanelTab} from './kolam-surface-panel-types';
import {KolamSurfacePanelTabButton} from './kolam-surface-panel-tab';

export function KolamSurfacePanelTabs<TabId extends string = string>({
  onSelectTab,
  selectedTabId,
  tabs,
}: {
  onSelectTab: (tabId: TabId) => void;
  selectedTabId: TabId;
  tabs: KolamSurfacePanelTab<TabId>[];
}) {
  return (
    <KolamListFrame variant="surfacePanelTabs">
      <KolamMappedList
        items={tabs}
        getKey={tab => tab.id}
        renderItem={tab => (
          <KolamSurfacePanelTabButton
            onSelectTab={onSelectTab}
            selectedTabId={selectedTabId}
            tab={tab}
          />
        )}
      />
    </KolamListFrame>
  );
}