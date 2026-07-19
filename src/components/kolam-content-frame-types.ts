import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

export type KolamContentFrameVariant =
  | 'checkoutPane'
  | 'checkoutCatalogPane'
  | 'checkoutCartList'
  | 'checkoutWorkspace'
  | 'statusPanelBody'
  | 'userMenuList'
  | 'commandPaletteSection'
  | 'commandPaletteEmpty'
  | 'dashboardSalesGraphEmpty'
  | 'dashboardSalesGraphPlot'
  | 'detailPanelBody'
  | 'detailWarningBox'
  | 'cashflowPreview'
  | 'nativeFormSection'
  | 'nativeFormControls'
  | 'settingsWebConfig'
  | 'settingsWebFormSections'
  | 'settingsWebFormSection';

export interface KolamContentFrameProps {
  accessibilityLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant: KolamContentFrameVariant;
}
