import type {ReactNode} from 'react';

export interface KolamSurfacePanelTab<TabId extends string = string> {
  id: TabId;
  label: string;
}

export interface KolamSurfacePanelProps<TabId extends string = string> {
  children: ReactNode;
  description: string;
  onSelectTab: (tabId: TabId) => void;
  selectedTabId: TabId;
  tabs: KolamSurfacePanelTab<TabId>[];
  title: string;
}
