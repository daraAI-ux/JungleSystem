import React from 'react';
import {
  KolamSurfacePanel,
  type KolamSurfacePanelProps,
  type KolamSurfacePanelTab,
} from './kolam-surface-panel';

export interface KolamMappedSurfacePanelProps<
  TabItem,
  TabId extends string = string,
> extends Omit<KolamSurfacePanelProps<TabId>, 'tabs'> {
  getTab: (item: TabItem) => KolamSurfacePanelTab<TabId>;
  tabItems: TabItem[];
}

export function KolamMappedSurfacePanel<
  TabItem,
  TabId extends string = string,
>({
  getTab,
  tabItems,
  ...props
}: KolamMappedSurfacePanelProps<TabItem, TabId>) {
  return (
    <KolamSurfacePanel
      {...props}
      tabs={tabItems.map(item => getTab(item))}
    />
  );
}
