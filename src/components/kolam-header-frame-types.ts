import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export type KolamHeaderFrameVariant =
  | 'attentionPanel'
  | 'catalogCard'
  | 'checkoutSummary'
  | 'dashboardHeader'
  | 'dashboardCountSection'
  | 'dashboardVisitConfirmations'
  | 'pendingOrders'
  | 'pendingOrdersTitleRow'
  | 'pendingOrdersMetaRow'
  | 'dashboardRail'
  | 'detailPanel'
  | 'salesGraph'
  | 'salesGraphSummaryColumn'
  | 'salesGraphTitleRow'
  | 'salesGraphDescriptionRow'
  | 'metricCard'
  | 'menuSection'
  | 'menuTitle'
  | 'moduleSection'
  | 'paginationFooter'
  | 'pluginSummary'
  | 'runtimeActionCard'
  | 'runtimeIdentityStrip'
  | 'runtimeIdentityCard'
  | 'sectionHeader'
  | 'settingsRoleEditorHeader'
  | 'settingsRoleInfoPanel'
  | 'settingsWebFormHeader'
  | 'statusPanel'
  | 'statusPanelTitleRow'
  | 'surfacePanel'
  | 'syncActivityItem'
  | 'userMenuHeader'
  | 'rolePermissionGroup';

export interface KolamHeaderFrameProps {
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant: KolamHeaderFrameVariant;
}
