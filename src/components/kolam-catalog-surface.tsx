import React from 'react';
import type {KolamCatalogSurfaceProps} from './kolam-workspace-module-surface-types';
import {KolamCatalogModule} from './kolam-pos-workspace-widgets';

export function KolamCatalogSurface({
  catalog,
}: {
  catalog: KolamCatalogSurfaceProps;
}) {
  return <KolamCatalogModule {...catalog} />;
}
