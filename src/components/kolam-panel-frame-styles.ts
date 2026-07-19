import {StyleSheet, type ViewStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getTopNavChromeContract} from '../domain/top-nav';
import {KOLAM_COMMAND_MENU_VISUAL} from './kolam-command-palette-visual';

const TOP_NAV_CHROME = getTopNavChromeContract();

const liveCardShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: V.surface.cardShadow.offsetY},
  shadowOpacity: V.surface.cardShadow.opacity,
  shadowRadius: V.surface.cardShadow.radius,
  elevation: V.surface.cardShadow.elevation,
} satisfies ViewStyle;

const liveCardChrome = {
  borderRadius: V.surface.cardChrome.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
} satisfies ViewStyle;

const borderedPanelChrome = {
  overflow: 'hidden',
  borderRadius: V.radius.lg,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: 1,
} satisfies ViewStyle;

export const panelFrameStyles = StyleSheet.create({
  auth: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginTop: V.layout.cardSpacing,
    marginBottom: 14,
    padding: 14,
    ...borderedPanelChrome,
  },
  attention: {
    position: 'absolute',
    top: V.layout.topNavHeight - 1,
    right: V.layout.contentPadding,
    zIndex: 20,
    width: 380,
    ...borderedPanelChrome,
  },
  commandPalette: {
    width: '100%',
    maxWidth: KOLAM_COMMAND_MENU_VISUAL.panelMaxWidth,
    maxHeight: 620,
    borderRadius: V.radius.xl,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detail: {
    marginHorizontal: V.layout.tableCellPaddingX,
    marginTop: 12,
    marginBottom: 4,
    ...borderedPanelChrome,
  },
  module: {
    padding: V.layout.cardSpacing,
    ...liveCardChrome,
  },
  status: {
    marginBottom: 18,
    overflow: 'hidden',
    ...liveCardChrome,
    ...liveCardShadow,
  },
  surface: {
    marginTop: V.layout.cardCompactSpacing,
    ...borderedPanelChrome,
  },
  userMenu: {
    position: 'absolute',
    top: V.layout.topNavHeight - 1,
    right: V.layout.contentPadding,
    zIndex: 21,
    width: TOP_NAV_CHROME.menuMinWidth,
    ...borderedPanelChrome,
  },
});