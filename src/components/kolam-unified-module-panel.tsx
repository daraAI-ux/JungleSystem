import React from 'react';
import {KolamModulePanel} from './kolam-surface-widgets';
import {KolamUnifiedModuleContent} from './kolam-unified-module-content';
import type {KolamUnifiedModulePanelProps} from './kolam-unified-overview-panel-types';

export function KolamUnifiedModulePanel(props: KolamUnifiedModulePanelProps) {
  const {module} = props.context;

  return (
    <KolamModulePanel title={module.label} hint={module.summary}>
      <KolamUnifiedModuleContent {...props} />
    </KolamModulePanel>
  );
}
