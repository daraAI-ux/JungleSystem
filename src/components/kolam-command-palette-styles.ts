import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  KOLAM_COMMAND_MENU_VISUAL,
  KOLAM_COMMAND_SEARCH_FIELD_VISUAL,
} from './kolam-command-palette-visual';

export const commandPaletteStyles = StyleSheet.create({
  commandPaletteOverlay: {
    position: 'absolute',
    top: V.layout.topNavHeight,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 30,
    alignItems: 'center',
    paddingTop: Math.max(
      0,
      KOLAM_COMMAND_MENU_VISUAL.panelTopOffset - V.layout.topNavHeight,
    ),
    paddingHorizontal: V.layout.contentPadding,
  },
  commandPalettePanel: {
    width: '100%',
    maxWidth: KOLAM_COMMAND_MENU_VISUAL.panelMaxWidth,
    maxHeight: 620,
    overflow: 'hidden',
    borderRadius: V.radius.xl,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  commandPaletteSearchRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomColor: V.colors.border,
    borderBottomWidth: KOLAM_COMMAND_MENU_VISUAL.searchBorderBottom ? 1 : 0,
  },
  commandPaletteSearchField: {
    minHeight: KOLAM_COMMAND_SEARCH_FIELD_VISUAL.commandHeight,
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  commandPaletteInput: {
    fontSize: 14,
    fontWeight: '600',
  },
  commandPaletteScroll: {
    maxHeight: 480,
    paddingHorizontal: KOLAM_COMMAND_MENU_VISUAL.listPadding,
    paddingVertical: KOLAM_COMMAND_MENU_VISUAL.listPadding,
  },
  commandPaletteSection: {
    marginBottom: 22,
  },
  commandPaletteSectionTitle: {
    paddingHorizontal: KOLAM_COMMAND_MENU_VISUAL.sectionHeaderPaddingX,
    paddingBottom: 5,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  commandPaletteEmpty: {
    paddingHorizontal: V.layout.cardSpacing,
    paddingVertical: V.layout.cardSpacing,
  },
});
