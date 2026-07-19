import {StyleSheet} from 'react-native';
import {getKolamControlTabsVisualContract} from '../domain/kolam-control-tabs';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_CONTROL_TABS_VISUAL = getKolamControlTabsVisualContract();

export const surfacePanelStyles = StyleSheet.create({
  panel: {
    marginTop: V.layout.cardCompactSpacing,
    overflow: 'hidden',
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: V.layout.tableCellPaddingY,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  description: {
    marginTop: 3,
    maxWidth: 420,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: KOLAM_CONTROL_TABS_VISUAL.tabListGap,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
});
