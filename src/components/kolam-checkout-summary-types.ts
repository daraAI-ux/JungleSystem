import type {KolamCheckoutWorkspaceProps} from './kolam-checkout-workspace-main';

export type KolamCheckoutSummaryPanelProps = Omit<
  KolamCheckoutWorkspaceProps,
  | 'activeType'
  | 'catalogSearch'
  | 'filteredCatalog'
  | 'onAddToCart'
  | 'onCatalogSearchChange'
  | 'onTypeChange'
  | 'recentSales'
>;
