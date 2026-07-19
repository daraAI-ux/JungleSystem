import {StyleSheet} from 'react-native';
import {getSettingsPaginationVisualContract} from '../domain/settings-surface';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const SETTINGS_PAGINATION_VISUAL = getSettingsPaginationVisualContract();

export const paginationFooterStyles = StyleSheet.create({
  footer: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 11,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  summary: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SETTINGS_PAGINATION_VISUAL.gapPx,
  },
});
