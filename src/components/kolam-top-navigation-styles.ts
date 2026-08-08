import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {TOP_NAV_CHROME} from './kolam-top-navigation-visual';

export const topNavigationStyles = StyleSheet.create({
  topNav: {
    minHeight: TOP_NAV_CHROME.height,
    paddingHorizontal: 12,
    backgroundColor: TOP_NAV_CHROME.backgroundColor,
    borderBottomColor: V.colors.border,
    borderBottomWidth: TOP_NAV_CHROME.borderBottomWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  topNavLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOP_NAV_CHROME.leftGap,
  },
  topNavSeparator: {
    width: 1,
    height: TOP_NAV_CHROME.separatorHeight,
    backgroundColor: V.colors.border,
  },
  breadcrumbTrail: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbSeparator: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  topNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: TOP_NAV_CHROME.rightGap,
  },
  metricsHost: {
    minWidth: 0,
    flexShrink: 1,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 16,
    overflow: 'hidden',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: V.control.badgeRadius,
    color: V.colors.primaryFg,
    backgroundColor: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
});
