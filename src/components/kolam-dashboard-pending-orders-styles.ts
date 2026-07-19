import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {PENDING_ORDERS_VISUAL} from './kolam-dashboard-pending-orders-visual';

export const pendingOrdersStyles = StyleSheet.create({
  pendingOrdersClockIcon: {
    width: PENDING_ORDERS_VISUAL.header.iconSize,
    height: PENDING_ORDERS_VISUAL.header.iconSize,
    borderRadius: PENDING_ORDERS_VISUAL.header.iconSize / 2,
    borderColor: V.colors.warning,
    borderWidth: PENDING_ORDERS_VISUAL.clockIcon.borderWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingOrdersClockHandHour: {
    position: 'absolute',
    width: PENDING_ORDERS_VISUAL.clockIcon.hourHandWidth,
    height: PENDING_ORDERS_VISUAL.clockIcon.hourHandHeight,
    borderRadius: PENDING_ORDERS_VISUAL.clockIcon.handRadius,
    backgroundColor: V.colors.warning,
    transform: [
      {translateY: PENDING_ORDERS_VISUAL.clockIcon.hourHandTranslateY},
    ],
  },
  pendingOrdersClockHandMinute: {
    position: 'absolute',
    width: PENDING_ORDERS_VISUAL.clockIcon.minuteHandWidth,
    height: PENDING_ORDERS_VISUAL.clockIcon.minuteHandHeight,
    borderRadius: PENDING_ORDERS_VISUAL.clockIcon.handRadius,
    backgroundColor: V.colors.warning,
    transform: [
      {translateX: PENDING_ORDERS_VISUAL.clockIcon.minuteHandTranslateX},
    ],
  },
  pendingOrdersTitle: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.header.titleFontSize,
    fontWeight: '800',
  },
  pendingOrdersDescription: {
    marginTop: PENDING_ORDERS_VISUAL.header.gapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.header.descriptionFontSize,
  },
  pendingOrdersLinkText: {
    color: V.colors[PENDING_ORDERS_VISUAL.header.actionColor],
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.header.actionFontSize,
    fontWeight: '700',
    textAlign: 'right',
  },
  pendingOrdersSectionTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.content.sectionTitleFontSize,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pendingOrdersRowIdentity: {
    minWidth: PENDING_ORDERS_VISUAL.row.invoiceMinWidth,
    flex: 1,
  },
  pendingOrdersInvoice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.row.invoiceFontSize,
    fontWeight: '800',
  },
  pendingOrdersRowMeta: {
    marginTop: PENDING_ORDERS_VISUAL.row.metaGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.row.metaFontSize,
  },
  pendingOrdersLifecycle: {
    marginTop: PENDING_ORDERS_VISUAL.row.metaGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.row.metaFontSize,
    fontWeight: '700',
  },
  pendingOrdersRowTotal: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.row.totalFontSize,
    fontWeight: '800',
  },
  pendingOrdersCapped: {
    paddingHorizontal: PENDING_ORDERS_VISUAL.content.rowPaddingX,
    paddingVertical: PENDING_ORDERS_VISUAL.content.cappedPaddingY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.content.cappedFontSize,
    textAlign: 'center',
  },
  pendingOrdersEmpty: {
    paddingHorizontal: PENDING_ORDERS_VISUAL.content.rowPaddingX,
    paddingVertical: PENDING_ORDERS_VISUAL.content.emptyPaddingY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.content.emptyFontSize,
    textAlign: 'center',
  },
  pendingOrdersRangeLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.range.labelFontSize,
    fontWeight: '700',
  },
  pendingOrdersValue: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.range.valueFontSize,
    fontWeight: '800',
  },
  pendingOrdersCount: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: PENDING_ORDERS_VISUAL.row.countFontSize,
  },
});
