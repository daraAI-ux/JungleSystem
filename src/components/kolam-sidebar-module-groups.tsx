import React from 'react';
import {getShellModulesByArea, type AppModule} from '../domain/app-shell';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSidebarModuleGroup} from './kolam-sidebar-module-group';

type SidebarModuleGroupDescriptor = {
  area: Parameters<typeof getShellModulesByArea>[0];
  label: string;
};

const SIDEBAR_MODULE_GROUPS: SidebarModuleGroupDescriptor[] = [
  {area: 'pos', label: 'POS'},
  {area: 'am', label: 'AM'},
  {area: 'plugins', label: 'Plugin'},
  {area: 'preparation', label: 'Preparation'},
];

export function KolamSidebarModuleGroups({
  activeModule,
  collapsed,
  onSelect,
}: {
  activeModule: AppModule;
  collapsed: boolean;
  onSelect: (module: AppModule) => void;
}) {
  return (
    <KolamMappedList
      items={SIDEBAR_MODULE_GROUPS}
      getKey={group => group.area}
      renderItem={group => (
        <KolamSidebarModuleGroup
          activeModule={activeModule}
          area={group.area}
          collapsed={collapsed}
          label={group.label}
          onSelect={onSelect}
        />
      )}
    />
  );
}
