import { StyleSheet } from 'react-native';
import { getDashboardHeaderVisualContract } from '../domain/dashboard-header';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

const DASHBOARD_HEADER_VISUAL = getDashboardHeaderVisualContract();

export const dashboardHeaderStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: DASHBOARD_HEADER_VISUAL.layout.alignItems,
    gap: DASHBOARD_HEADER_VISUAL.layout.gap,
    minHeight: DASHBOARD_HEADER_VISUAL.layout.minHeight,
    marginBottom: V.layout.cardSpacing,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    marginBottom: DASHBOARD_HEADER_VISUAL.eyebrow.marginBottom,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_HEADER_VISUAL.eyebrow.fontSize,
    fontWeight: '700',
    letterSpacing: DASHBOARD_HEADER_VISUAL.eyebrow.letterSpacing,
    textTransform: DASHBOARD_HEADER_VISUAL.eyebrow.textTransform,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_HEADER_VISUAL.title.fontSize,
    lineHeight: DASHBOARD_HEADER_VISUAL.title.lineHeight,
    fontWeight:
      DASHBOARD_HEADER_VISUAL.title.fontWeight === 'bold' ? '700' : '600',
    letterSpacing: DASHBOARD_HEADER_VISUAL.title.appliedLetterSpacing,
  },
  headerSubtitle: {
    marginTop: DASHBOARD_HEADER_VISUAL.description.marginTop,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_HEADER_VISUAL.description.fontSize,
  },
  headerControls: {
    flexDirection: 'row',
    flexWrap: DASHBOARD_HEADER_VISUAL.actions.flexWrap,
    alignItems: DASHBOARD_HEADER_VISUAL.actions.alignItems,
    justifyContent: DASHBOARD_HEADER_VISUAL.actions.justifyContent,
    flexShrink: DASHBOARD_HEADER_VISUAL.actions.flexShrink,
    gap: DASHBOARD_HEADER_VISUAL.actions.gapX,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: DASHBOARD_HEADER_VISUAL.actions.alignItems,
    justifyContent: DASHBOARD_HEADER_VISUAL.actions.justifyContent,
    gap: DASHBOARD_HEADER_VISUAL.actions.gapX,
  },
  syncIndicatorBadge: {
    flexShrink: 0,
  },
  sessionPill: {
    minWidth: DASHBOARD_HEADER_VISUAL.sessionPill.minWidth,
    padding: DASHBOARD_HEADER_VISUAL.sessionPill.padding,
    borderRadius: DASHBOARD_HEADER_VISUAL.sessionPill.radius,
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.border,
    borderWidth: DASHBOARD_HEADER_VISUAL.sessionPill.borderWidth,
  },
  sessionLabel: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_HEADER_VISUAL.sessionPill.labelFontSize,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sessionValue: {
    marginTop: DASHBOARD_HEADER_VISUAL.sessionPill.valueGapY,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_HEADER_VISUAL.sessionPill.valueFontSize,
    fontWeight: '800',
  },
});
