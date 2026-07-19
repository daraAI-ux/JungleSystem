import {headerFrameStyles as styles} from './kolam-header-frame-styles';
import type {KolamHeaderFrameVariant} from './kolam-header-frame-types';

export function getHeaderFrameStyle(variant: KolamHeaderFrameVariant) {
  switch (variant) {
    case 'attentionPanel':
      return styles.attentionPanel;
    case 'catalogCard':
      return styles.catalogCard;
    case 'checkoutSummary':
      return styles.checkoutSummary;
    case 'dashboardHeader':
      return styles.dashboardHeader;
    case 'dashboardCountSection':
      return styles.dashboardCountSection;
    case 'dashboardVisitConfirmations':
      return styles.dashboardVisitConfirmations;
    case 'detailPanel':
      return styles.detailPanel;
    case 'pendingOrders':
      return styles.pendingOrders;
    case 'pendingOrdersTitleRow':
      return styles.pendingOrdersTitleRow;
    case 'pendingOrdersMetaRow':
      return styles.pendingOrdersMetaRow;
    case 'dashboardRail':
      return styles.dashboardRail;
    case 'salesGraph':
      return styles.salesGraph;
    case 'salesGraphSummaryColumn':
      return styles.salesGraphSummaryColumn;
    case 'salesGraphTitleRow':
      return styles.salesGraphTitleRow;
    case 'salesGraphDescriptionRow':
      return styles.salesGraphDescriptionRow;
    case 'metricCard':
      return styles.metricCard;
    case 'menuSection':
      return styles.menuSection;
    case 'menuTitle':
      return styles.menuTitle;
    case 'moduleSection':
      return styles.moduleSection;
    case 'paginationFooter':
      return styles.paginationFooter;
    case 'pluginSummary':
      return styles.pluginSummary;
    case 'runtimeActionCard':
      return styles.runtimeActionCard;
    case 'runtimeIdentityStrip':
      return styles.runtimeIdentityStrip;
    case 'runtimeIdentityCard':
      return styles.runtimeIdentityCard;
    case 'sectionHeader':
      return styles.sectionHeader;
    case 'settingsRoleEditorHeader':
      return styles.settingsRoleEditorHeader;
    case 'settingsRoleInfoPanel':
      return styles.settingsRoleInfoPanel;
    case 'settingsWebFormHeader':
      return styles.settingsWebFormHeader;
    case 'statusPanel':
      return styles.statusPanel;
    case 'userMenuHeader':
      return styles.userMenuHeader;
    case 'statusPanelTitleRow':
      return styles.statusPanelTitleRow;
    case 'surfacePanel':
      return styles.surfacePanel;
    case 'syncActivityItem':
      return styles.syncActivityItem;
    case 'rolePermissionGroup':
      return styles.rolePermissionGroup;
  }
}
