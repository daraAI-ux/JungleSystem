import React from 'react';
import {KolamUnifiedPluginContent} from './kolam-unified-plugin-content';
import {KolamUnifiedSurfaceContent} from './kolam-unified-surface-content';
import type {KolamUnifiedModulePanelProps} from './kolam-unified-overview-panel-types';

export function KolamUnifiedModuleContent(props: KolamUnifiedModulePanelProps) {
  if (props.context.module.id === 'plugins') {
    return <KolamUnifiedPluginContent {...props} />;
  }

  return <KolamUnifiedSurfaceContent {...props} />;
}
