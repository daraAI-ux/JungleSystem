import {StyleSheet} from 'react-native';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KOLAM_COMMAND_MENU_VISUAL} from './kolam-command-palette-visual';
import {TOP_NAV_CHROME} from './kolam-top-navigation-visual';

const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();

export const shellFrameStyles = StyleSheet.create({
  appShell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: V.colors.bg,
  },
  appMain: {
    flex: 1,
    backgroundColor: V.colors.mainSurface,
  },
  commandPaletteOverlay: {
    position: 'absolute',
    top: V.layout.topNavHeight,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 30,
    alignItems: 'center',
    paddingTop: Math.max(
      0,
      KOLAM_COMMAND_MENU_VISUAL.panelTopOffset - V.layout.topNavHeight,
    ),
    paddingHorizontal: V.layout.contentPadding,
  },
  dashboardLayout: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: DASHBOARD_LAYOUT_VISUAL.layout.gapY,
    marginBottom: 0,
  },
  dashboardMain: {
    width: '100%',
    flex: 1,
    minWidth: 0,
  },
  topNavigation: {
    minHeight: TOP_NAV_CHROME.height,
    paddingHorizontal: V.layout.contentPadding,
    backgroundColor: TOP_NAV_CHROME.backgroundColor,
    borderBottomColor: V.colors.border,
    borderBottomWidth: TOP_NAV_CHROME.borderBottomWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
});
