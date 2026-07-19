import React from 'react';
import {
  getShellAreaCoverage,
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
  const coverage = getShellAreaCoverage(area);

  return (
    <KolamSidebarNavGroup
      activeModule={activeModule}
      collapsed={collapsed}
      label={label}
      meta={coverage.summaryLabel}
      modules={getShellModulesByArea(area)}
      onSelect={onSelect}
    />
  );
}
