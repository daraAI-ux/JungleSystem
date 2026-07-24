import React from 'react';
import {
  getShellModulesByArea,
  type AppModule,
} from '../domain/app-shell';
import {KolamSidebarNavGroup} from './kolam-sidebar-nav-group';

export function KolamSidebarModuleGroup({
  activeModule,
  area,
  collapsed,
  label,
  onSelect,
}: {
  activeModule: AppModule;
  area: Parameters<typeof getShellModulesByArea>[0];
  collapsed: boolean;
  label: string;
  onSelect: (module: AppModule) => void;
}) {
  return (
    <KolamSidebarNavGroup
      activeModule={activeModule}
      collapsed={collapsed}
      label={label}
      modules={getShellModulesByArea(area)}
      onSelect={onSelect}
    />
  );
}
