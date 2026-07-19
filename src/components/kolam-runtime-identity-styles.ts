import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const runtimeIdentityStyles = StyleSheet.create({
  runtimeIdentityStrip: {
    marginBottom: 14,
    padding: V.layout.cardCompactSpacing,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  runtimeIdentityHeader: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  runtimeIdentityTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  runtimeIdentityMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  runtimeIdentityClientPill: {
    minHeight: 26,
    justifyContent: 'center',
    paddingHorizontal: V.control.badgePaddingX,
    borderRadius: V.control.badgeRadius,
    backgroundColor: V.colors.infoSoft,
  },
  runtimeIdentityClientText: {
    color: V.colors.info,
    fontFamily: V.fontFamily,
    fontSize: V.control.badgeFontSize,
    fontWeight: '900',
  },
  runtimeIdentityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  runtimeIdentityItem: {
    flexGrow: 1,
    flexBasis: '23%',
    minWidth: 190,
    minHeight: 88,
    padding: V.layout.cardCompactSpacing,
    borderRadius: 8,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  runtimeIdentityItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  runtimeIdentityLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  runtimeIdentityBadge: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  runtimeIdentityBadgeReady: {
    backgroundColor: V.colors.successSoft,
  },
  runtimeIdentityBadgePartial: {
    backgroundColor: V.colors.infoSoft,
  },
  runtimeIdentityBadgeBlocked: {
    backgroundColor: V.colors.warningSoft,
  },
  runtimeIdentityBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  runtimeIdentityBadgeDotReady: {
    backgroundColor: V.colors.success,
  },
  runtimeIdentityBadgeDotPartial: {
    backgroundColor: V.colors.info,
  },
  runtimeIdentityBadgeDotBlocked: {
    backgroundColor: V.colors.warning,
  },
  runtimeIdentityBadgeText: {
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  runtimeIdentityBadgeTextReady: {
    color: V.colors.success,
  },
  runtimeIdentityBadgeTextPartial: {
    color: V.colors.info,
  },
  runtimeIdentityBadgeTextBlocked: {
    color: V.colors.warning,
  },
  runtimeIdentityValue: {
    marginTop: 10,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  runtimeIdentityDetail: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
});
