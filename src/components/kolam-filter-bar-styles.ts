import {StyleSheet} from 'react-native';
import {getSettingsActivityLogFilterVisualContract} from '../domain/settings-surface';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const FILTER_VISUAL = getSettingsActivityLogFilterVisualContract();
const inputShadow = {
  shadowColor: V.colors.fg,
  shadowOffset: {width: 0, height: 1},
  shadowOpacity: 0.04,
  shadowRadius: 1,
};

export const filterBarStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: FILTER_VISUAL.gapPx,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  search: {
    minWidth: 220,
    minHeight: FILTER_VISUAL.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: V.control.inputPaddingX,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderWidth: 1,
    ...inputShadow,
  },
  searchWide: {
    minWidth: FILTER_VISUAL.searchMinWidth,
  },
  placeholder: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  refreshButton: {
    minHeight: FILTER_VISUAL.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderWidth: 1,
    ...inputShadow,
  },
  refreshIcon: {
    width: 15,
    height: 15,
  },
  refreshArc: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderTopColor: V.colors.fg,
    borderRightColor: V.colors.fg,
    borderBottomColor: 'transparent',
    borderLeftColor: V.colors.fg,
    borderWidth: 1.6,
  },
  refreshArrow: {
    position: 'absolute',
    right: 0,
    top: 1,
    width: 5,
    height: 5,
    borderTopColor: V.colors.fg,
    borderTopWidth: 1.6,
    borderRightColor: V.colors.fg,
    borderRightWidth: 1.6,
    transform: [{rotate: '45deg'}],
  },
});
