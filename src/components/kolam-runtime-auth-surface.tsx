import React from 'react';
import {KolamAuthPanel} from './kolam-shell-widgets';
import type {KolamAuthPanelProps} from './kolam-runtime-panel-surface-types';

export function KolamRuntimeAuthSurface({auth}: {auth: KolamAuthPanelProps}) {
  return <KolamAuthPanel {...auth} />;
}
