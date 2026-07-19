import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getTopNavChromeContract} from '../domain/top-nav';

const TOP_NAV_CHROME = getTopNavChromeContract();

export const userMenuPanelStyles = StyleSheet.create({
  userMenuPanel: {
    position: 'absolute',
    top: V.layout.topNavHeight - 1,
    right: V.layout.contentPadding,
    zIndex: 21,
    width: TOP_NAV_CHROME.menuMinWidth,
    overflow: 'hidden',
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  userMenuHeader: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: V.layout.cardCompactSpacing,
    paddingVertical: 12,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  userMenuAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  userMenuAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userMenuAvatarText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  userMenuProfile: {
    flex: 1,
    minWidth: 0,
  },
  userMenuName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  userMenuEmail: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  userMenuScope: {
    marginTop: 5,
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  userMenuList: {
    paddingVertical: 4,
  },
});
