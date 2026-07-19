import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getPluginSurfaceRowVisualContract} from '../domain/plugin-surface';

const PLUGIN_SURFACE_ROW_VISUAL = getPluginSurfaceRowVisualContract();
const liveCardChrome = {
  borderRadius: V.surface.cardChrome.radius,
  backgroundColor: V.colors.bg,
  borderColor: V.colors.border,
  borderWidth: V.surface.cardChrome.borderWidth,
};

export const pluginSummaryCardStyles = StyleSheet.create({
  pluginSummaryCard: {
    flex: 1,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: PLUGIN_SURFACE_ROW_VISUAL.summaryCard.cardSpacing,
    paddingVertical: 8,
    ...liveCardChrome,
  },
  pluginSummaryCardSuccess: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.successSoft,
  },
  pluginSummaryCardWarning: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.warningSoft,
  },
  pluginSummaryCardInfo: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.infoSoft,
  },
  pluginSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pluginSummaryIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: V.colors.muted,
  },
  pluginSummaryIconSuccess: {
    backgroundColor: V.colors.successSoft,
  },
  pluginSummaryIconWarning: {
    backgroundColor: V.colors.warningSoft,
  },
  pluginSummaryIconInfo: {
    backgroundColor: V.colors.infoSoft,
  },
  pluginSummaryValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  pluginSummaryValueSuccess: {
    color: V.colors.success,
  },
  pluginSummaryValueWarning: {
    color: V.colors.warning,
  },
  pluginSummaryValueInfo: {
    color: V.colors.info,
  },
  pluginSummaryLabel: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
});
