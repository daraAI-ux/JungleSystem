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
  const nextWorkspaceTabIdRef = React.useRef(1);
  const [tabs, setTabs] = React.useState<KolamWorkspaceTab[]>(() => [
    createWorkspaceTab(snapshot, nextWorkspaceTabIdRef),
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
    setTabs(currentTabs => {
      const usedIds = new Set(currentTabs.map(tab => tab.id));
      const nextTab = createWorkspaceTab(
        snapshot,
        nextWorkspaceTabIdRef,
        usedIds,
      );

      setActiveTabId(nextTab.id);
      return [...currentTabs, nextTab];
    });
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

function createWorkspaceTab(
  snapshot: KolamWorkspaceTabSnapshot,
  nextWorkspaceTabIdRef: React.MutableRefObject<number>,
  usedIds = new Set<string>(),
): KolamWorkspaceTab {
  let id = `workspace-tab-${nextWorkspaceTabIdRef.current}`;

  while (usedIds.has(id)) {
    nextWorkspaceTabIdRef.current += 1;
    id = `workspace-tab-${nextWorkspaceTabIdRef.current}`;
  }

  nextWorkspaceTabIdRef.current += 1;

  return {
    id,
    label: getKolamWorkspaceTabLabel(snapshot),
    snapshot,
  };
}
