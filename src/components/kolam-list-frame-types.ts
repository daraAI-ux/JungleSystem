import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export type KolamListFrameVariant =
  | 'wrap'
  | 'pill'
  | 'avatar'
  | 'metric'
  | 'dashboardCount'
  | 'dashboardMetric'
  | 'runtimeActionGrid'
  | 'runtimeIdentityGrid'
  | 'pluginSummaryGrid'
  | 'statsCardStrip'
  | 'pendingOrdersGrid'
  | 'catalogGrid'
  | 'dashboardRail'
  | 'dashboardRailAction'
  | 'breadcrumbTrail'
  | 'pluginList'
  | 'attentionList'
  | 'attentionActions'
  | 'authControls'
  | 'authSourcePicker'
  | 'formGrid'
  | 'operationalGrid'
  | 'operationalStack'
  | 'commandList'
  | 'descriptionList'
  | 'endpointList'
  | 'menuDockGroup'
  | 'cartActionRow'
  | 'discountControlRow'
  | 'saleActions'
  | 'dashboardHeaderActions'
  | 'dashboardVisitConfirmationsList'
  | 'topNavLeft'
  | 'topNavRight'
  | 'controlTabShell'
  | 'filterBar'
  | 'menuSectionActions'
  | 'pendingOrdersActionLink'
  | 'pendingOrdersBadges'
  | 'pendingOrdersStatusBadges'
  | 'roleEditorActions'
  | 'roleEditorToolbar'
  | 'roleInfoActions'
  | 'sellableCatalogTabs'
  | 'summaryBadges'
  | 'surfacePanelTabs'
  | 'commandPaletteSearchRow'
  | 'dashboardStatChannelRows'
  | 'dashboardStatChannelGrid';

export interface KolamListFrameProps {
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: KolamListFrameVariant;
}
