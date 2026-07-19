import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const infoListRowStyles = StyleSheet.create({
  row: {
    minHeight: V.layout.tableRowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: V.layout.tableCellPaddingY,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  routeRow: {
    gap: 14,
    paddingHorizontal: V.layout.tableCellPaddingX,
  },
  selected: {
    backgroundColor: V.colors.successSoft,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  commandTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  routeTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  commandDescription: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 11,
    lineHeight: 15,
  },
  routeDescription: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  routeDetail: {
    marginTop: 5,
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  commandMeta: {
    width: 230,
    alignItems: 'flex-end',
  },
  routeMeta: {
    width: 150,
    alignItems: 'flex-end',
  },
  commandBadge: {
    overflow: 'hidden',
    paddingHorizontal: V.control.badgePaddingX,
    paddingVertical: V.control.badgePaddingY,
    borderRadius: V.control.badgeRadius,
    color: V.colors.info,
    backgroundColor: V.colors.infoSoft,
    fontSize: V.control.badgeFontSize,
    fontWeight: '700',
  },
  routeBadge: {
    overflow: 'hidden',
    paddingHorizontal: V.control.badgePaddingX,
    paddingVertical: V.control.badgePaddingY,
    borderRadius: V.control.badgeRadius,
    color: V.colors.info,
    backgroundColor: V.colors.infoSoft,
    fontFamily: V.fontFamily,
    fontSize: V.control.badgeFontSize,
    fontWeight: '800',
  },
  commandMetaDetail: {
    marginTop: 5,
    color: V.colors.mutedFg,
    fontSize: 10,
    textAlign: 'right',
  },
  routeMetaDetail: {
    marginTop: 5,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
});
