import {shellFrameStyles as styles} from './kolam-shell-frame-styles';
import type {KolamShellFrameVariant} from './kolam-shell-frame-types';

export function getShellFrameStyle(variant: KolamShellFrameVariant) {
  switch (variant) {
    case 'appShell':
      return styles.appShell;
    case 'appMain':
      return styles.appMain;
    case 'commandPaletteOverlay':
      return styles.commandPaletteOverlay;
    case 'dashboardLayout':
      return styles.dashboardLayout;
    case 'dashboardMain':
      return styles.dashboardMain;
    case 'topNavigation':
      return styles.topNavigation;
  }
}