import {panelFrameStyles as styles} from './kolam-panel-frame-styles';
import type {KolamPanelFrameVariant} from './kolam-panel-frame-types';

export function getPanelFrameStyle(variant: KolamPanelFrameVariant) {
  switch (variant) {
    case 'auth':
      return styles.auth;
    case 'attention':
      return styles.attention;
    case 'commandPalette':
      return styles.commandPalette;
    case 'detail':
      return styles.detail;
    case 'module':
      return styles.module;
    case 'status':
      return styles.status;
    case 'surface':
      return styles.surface;
    case 'userMenu':
      return styles.userMenu;
  }
}