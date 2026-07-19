import {cardFrameStyles as styles} from './kolam-card-frame-styles';
import type {KolamCardFrameVariant} from './kolam-card-frame-types';

export function getCardFrameStyle(variant: KolamCardFrameVariant) {
  switch (variant) {
    case 'summary':
      return styles.summary;
    case 'info':
      return styles.info;
    case 'metricGrid':
      return styles.metricGrid;
    case 'readiness':
      return styles.readiness;
    case 'syncActivity':
      return styles.syncActivity;
    case 'syncStatusBar':
      return styles.syncStatusBar;
    case 'dashboardCount':
      return styles.dashboardCount;
    case 'dashboardInventoryCounts':
      return styles.dashboardInventoryCounts;
    case 'dashboardRail':
      return styles.dashboardRail;
    case 'dashboardRailEmpty':
      return styles.dashboardRailEmpty;
    case 'dashboardRailRow':
      return styles.dashboardRailRow;
    case 'dashboardPendingOrders':
      return styles.dashboardPendingOrders;
    case 'dashboardPendingOrdersSectionHeader':
      return styles.dashboardPendingOrdersSectionHeader;
    case 'dashboardPendingOrdersRow':
      return styles.dashboardPendingOrdersRow;
    case 'dashboardPendingOrdersRange':
      return styles.dashboardPendingOrdersRange;
    case 'dashboardSalesGraph':
      return styles.dashboardSalesGraph;
    case 'dashboardVisitConfirmations':
      return styles.dashboardVisitConfirmations;
    case 'pluginTable':
      return styles.pluginTable;
    case 'pluginSummary':
      return styles.pluginSummary;
    case 'checkoutAdjustment':
      return styles.checkoutAdjustment;
    case 'checkoutTotalBox':
      return styles.checkoutTotalBox;
    case 'catalogTable':
      return styles.catalogTable;
    case 'customerTable':
      return styles.customerTable;
    case 'menuDockItem':
      return styles.menuDockItem;
    case 'runtimeIdentityStrip':
      return styles.runtimeIdentityStrip;
    case 'runtimeIdentityItem':
      return styles.runtimeIdentityItem;
    case 'salesPanel':
      return styles.salesPanel;
    case 'salesTable':
      return styles.salesTable;
    case 'surfaceContractList':
      return styles.surfaceContractList;
    case 'settingsRouteList':
      return styles.settingsRouteList;
    case 'settingsActivityTable':
      return styles.settingsActivityTable;
    case 'settingsPermissionMatrix':
      return styles.settingsPermissionMatrix;
    case 'settingsRoleInfoNotice':
      return styles.settingsRoleInfoNotice;
    case 'settingsRoleMatrix':
      return styles.settingsRoleMatrix;
    case 'settingsRolePermissionGroup':
      return styles.settingsRolePermissionGroup;
    case 'settingsWebLogoPreview':
      return styles.settingsWebLogoPreview;
    case 'settingsWebSwitchRow':
      return styles.settingsWebSwitchRow;
    case 'unifiedRuntimeFooter':
      return styles.unifiedRuntimeFooter;
    case 'workflowNotice':
      return styles.workflowNotice;
    case 'compact':
    default:
      return styles.compact;
  }
}
