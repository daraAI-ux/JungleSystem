import React from 'react';
import {
  KolamAmOperationalPanel,
  KolamSurfaceContractList,
} from './kolam-unified-operational-widgets';
import {KolamSurfaceLauncher} from './kolam-surface-launcher';
import {KolamUnifiedModuleSourcePanel} from './kolam-unified-module-source-panel';
import type {KolamUnifiedModulePanelProps} from './kolam-unified-overview-panel-types';

export function KolamUnifiedSurfaceContent({
  context,
  onSurfaceSelect,
  surfaces,
}: KolamUnifiedModulePanelProps) {
  return (
    <>
      {context.module.id === 'am' ? (
        <KolamAmOperationalPanel dataset={context.dataset} />
      ) : null}
      <KolamSurfaceLauncher
        label={`${context.module.label} Surface Launcher`}
        surfaces={surfaces}
        onSurfaceSelect={onSurfaceSelect}
      />
      <KolamSurfaceContractList surfaces={surfaces} />
      <KolamUnifiedModuleSourcePanel context={context} />
    </>
  );
}
