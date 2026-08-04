import React from 'react';
import {
  getKolamWorkspaceTabLabel,
  type KolamWorkspaceTab,
  type KolamWorkspaceTabSnapshot,
} from '../domain/kolam-workspace-tabs';

export interface KolamWorkspaceTabsController {
  activeTabId: string;
  handleCreateTab: () => void;
  handleTabClose: (tabId: string) => KolamWorkspaceTabSnapshot | null;
  handleTabSelect: (tabId: string) => KolamWorkspaceTabSnapshot | null;
  tabs: KolamWorkspaceTab[];
}

export function useKolamWorkspaceTabsController({
  snapshot,
}: {
  snapshot: KolamWorkspaceTabSnapshot;
}): KolamWorkspaceTabsController {
  const [tabs, setTabs] = React.useState<KolamWorkspaceTab[]>(() => [
    createWorkspaceTab(snapshot),
  ]);
  const [activeTabId, setActiveTabId] = React.useState(() => tabs[0].id);
  const restoringTabIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (restoringTabIdRef.current === activeTabId) {
      restoringTabIdRef.current = null;
      return;
    }

    setTabs(currentTabs =>
      currentTabs.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              label: getKolamWorkspaceTabLabel(snapshot),
              snapshot,
            }
          : tab,
      ),
    );
  }, [activeTabId, snapshot]);

  const handleCreateTab = React.useCallback(() => {
    const nextTab = createWorkspaceTab(snapshot);
    setTabs(currentTabs => [...currentTabs, nextTab]);
    setActiveTabId(nextTab.id);
  }, [snapshot]);

  const handleTabSelect = React.useCallback(
    (tabId: string) => {
      const selectedTab = tabs.find(tab => tab.id === tabId);

      if (!selectedTab || selectedTab.id === activeTabId) {
        return null;
      }

      restoringTabIdRef.current = selectedTab.id;
      setActiveTabId(selectedTab.id);
      return selectedTab.snapshot;
    },
    [activeTabId, tabs],
  );

  const handleTabClose = React.useCallback(
    (tabId: string) => {
      const closedIndex = tabs.findIndex(tab => tab.id === tabId);

      if (closedIndex < 0 || tabs.length <= 1) {
        return null;
      }

      const nextTabs = tabs.filter(tab => tab.id !== tabId);
      const nextActiveTab =
        tabId === activeTabId
          ? nextTabs[Math.max(0, closedIndex - 1)]
          : tabs.find(tab => tab.id === activeTabId) ?? nextTabs[0];

      setTabs(nextTabs);
      if (tabId === activeTabId) {
        restoringTabIdRef.current = nextActiveTab.id;
      }
      setActiveTabId(nextActiveTab.id);

      return tabId === activeTabId ? nextActiveTab.snapshot : null;
    },
    [activeTabId, tabs],
  );

  return {
    activeTabId,
    handleCreateTab,
    handleTabClose,
    handleTabSelect,
    tabs,
  };
}

let nextWorkspaceTabId = 1;

function createWorkspaceTab(
  snapshot: KolamWorkspaceTabSnapshot,
): KolamWorkspaceTab {
  const id = `workspace-tab-${nextWorkspaceTabId}`;
  nextWorkspaceTabId += 1;

  return {
    id,
    label: getKolamWorkspaceTabLabel(snapshot),
    snapshot,
  };
}
