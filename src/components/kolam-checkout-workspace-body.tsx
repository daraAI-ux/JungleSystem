import React from 'react';
import {KolamCheckoutCatalogPane} from './kolam-checkout-catalog-pane';
import {KolamCheckoutWorkspaceSummaryPane} from './kolam-checkout-workspace-summary-pane';
import type {KolamCheckoutWorkspaceBodyProps} from './kolam-checkout-workspace-body-types';
import {KolamContentFrame} from './kolam-content-frame';

export type {KolamCheckoutWorkspaceBodyProps};

export function KolamCheckoutWorkspaceBody(
  props: KolamCheckoutWorkspaceBodyProps,
) {
  return (
    <KolamContentFrame variant="checkoutWorkspace">
      <KolamCheckoutCatalogPane
        activeType={props.activeType}
        catalogSearch={props.catalogSearch}
        filteredCatalog={props.filteredCatalog}
        onAddToCart={props.onAddToCart}
        onCatalogSearchChange={props.onCatalogSearchChange}
        onTypeChange={props.onTypeChange}
      />
      <KolamCheckoutWorkspaceSummaryPane {...props} />
    </KolamContentFrame>
  );
}