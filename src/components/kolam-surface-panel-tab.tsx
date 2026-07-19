import React from 'react';
import {KolamChoiceSegment} from './kolam-choice-segment';
import type {KolamSurfacePanelTab} from './kolam-surface-panel-types';

export function KolamSurfacePanelTabButton<TabId extends string = string>({
  onSelectTab,
  selectedTabId,
  tab,
}: {
  onSelectTab: (tabId: TabId) => void;
  selectedTabId: TabId;
  tab: KolamSurfacePanelTab<TabId>;
}) {
  return (
    <KolamChoiceSegment
      id={tab.id}
      label={tab.label}
      selectedId={selectedTabId}
      onSelect={onSelectTab}
      variant="tab"
    />
  );
}
