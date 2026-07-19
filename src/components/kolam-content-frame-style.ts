import {contentFrameStyles as styles} from './kolam-content-frame-styles';
import type {KolamContentFrameVariant} from './kolam-content-frame-types';

export function getContentFrameStyle(variant: KolamContentFrameVariant) {
  switch (variant) {
    case 'checkoutPane':
      return styles.checkoutPane;
    case 'checkoutCatalogPane':
      return styles.checkoutCatalogPane;
    case 'checkoutCartList':
      return styles.checkoutCartList;
    case 'checkoutWorkspace':
      return styles.checkoutWorkspace;
    case 'statusPanelBody':
      return styles.statusPanelBody;
    case 'userMenuList':
      return styles.userMenuList;
    case 'commandPaletteSection':
      return styles.commandPaletteSection;
    case 'commandPaletteEmpty':
      return styles.commandPaletteEmpty;
    case 'dashboardSalesGraphEmpty':
      return styles.dashboardSalesGraphEmpty;
    case 'dashboardSalesGraphPlot':
      return styles.dashboardSalesGraphPlot;
    case 'detailPanelBody':
      return styles.detailPanelBody;
    case 'detailWarningBox':
      return styles.detailWarningBox;
    case 'cashflowPreview':
      return styles.cashflowPreview;
    case 'nativeFormSection':
      return styles.nativeFormSection;
    case 'nativeFormControls':
      return styles.nativeFormControls;
    case 'settingsWebConfig':
      return styles.settingsWebConfig;
    case 'settingsWebFormSections':
      return styles.settingsWebFormSections;
    case 'settingsWebFormSection':
      return styles.settingsWebFormSection;
  }
}
