import type {ReactNode} from 'react';
import type {
  AccessibilityState,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

export type KolamCardFrameVariant =
  | 'compact'
  | 'summary'
  | 'info'
  | 'metricGrid'
  | 'readiness'
  | 'syncActivity'
  | 'syncStatusBar'
  | 'dashboardCount'
  | 'dashboardInventoryCounts'
  | 'dashboardRail'
  | 'dashboardRailEmpty'
  | 'dashboardRailRow'
  | 'dashboardPendingOrders'
  | 'dashboardPendingOrdersSectionHeader'
  | 'dashboardPendingOrdersRow'
  | 'dashboardPendingOrdersRange'
  | 'dashboardSalesGraph'
  | 'dashboardVisitConfirmations'
  | 'pluginTable'
  | 'pluginSummary'
  | 'checkoutAdjustment'
  | 'checkoutTotalBox'
  | 'catalogTable'
  | 'customerTable'
  | 'menuDockItem'
  | 'runtimeIdentityStrip'
  | 'runtimeIdentityItem'
  | 'salesPanel'
  | 'salesTable'
  | 'surfaceContractList'
  | 'settingsRouteList'
  | 'settingsActivityTable'
  | 'settingsPermissionMatrix'
  | 'settingsRoleInfoNotice'
  | 'settingsRoleMatrix'
  | 'settingsRolePermissionGroup'
  | 'settingsWebLogoPreview'
  | 'settingsWebSwitchRow'
  | 'unifiedRuntimeFooter'
  | 'workflowNotice';

export interface KolamCardFrameProps {
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: KolamCardFrameVariant;
}

export interface KolamInteractiveCardFrameProps extends KolamCardFrameProps {
  accessibilityState?: AccessibilityState;
  onPress?: (event: GestureResponderEvent) => void;
}
