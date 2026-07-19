import {StyleSheet} from 'react-native';
import {getKolamSearchFieldVisualContract} from '../domain/kolam-search-field';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_SEARCH_FIELD_VISUAL = getKolamSearchFieldVisualContract();

export const searchFieldStyles = StyleSheet.create({
  field: {
    minHeight: KOLAM_SEARCH_FIELD_VISUAL.defaultHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: KOLAM_SEARCH_FIELD_VISUAL.gap,
    paddingHorizontal: KOLAM_SEARCH_FIELD_VISUAL.paddingX,
    borderRadius: V.radius.lg,
    borderColor: V.colors.input,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  icon: {
    width: KOLAM_SEARCH_FIELD_VISUAL.iconSize,
    height: KOLAM_SEARCH_FIELD_VISUAL.iconSize,
  },
  lens: {
    position: 'absolute',
    left: 2,
    top: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderColor: V.colors.mutedFg,
    borderWidth: 2,
  },
  handle: {
    position: 'absolute',
    right: 2,
    bottom: 3,
    width: 8,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.mutedFg,
    transform: [{rotate: '45deg'}],
  },
  input: {
    minWidth: 0,
    minHeight: KOLAM_SEARCH_FIELD_VISUAL.defaultHeight - 2,
    flex: 1,
    paddingVertical: 0,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: V.control.fontSize,
    fontWeight: '700',
  },
  trailing: {
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: V.radius.sm,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
});
