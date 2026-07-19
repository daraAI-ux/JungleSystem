import {StyleSheet} from 'react-native';
import {getKolamCommandMenuVisualContract} from '../domain/kolam-command-menu';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

const KOLAM_COMMAND_MENU_VISUAL = getKolamCommandMenuVisualContract();

export const commandPaletteItemStyles = StyleSheet.create({
  row: {
    minHeight: KOLAM_COMMAND_MENU_VISUAL.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: KOLAM_COMMAND_MENU_VISUAL.rowGap,
    paddingHorizontal: KOLAM_COMMAND_MENU_VISUAL.rowPaddingX,
    paddingVertical: KOLAM_COMMAND_MENU_VISUAL.rowPaddingY,
    borderRadius: V.radius.sm,
    backgroundColor: 'transparent',
  },
  kindIcon: {
    width: KOLAM_COMMAND_MENU_VISUAL.iconSize,
    height: KOLAM_COMMAND_MENU_VISUAL.iconSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: 'transparent',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: KOLAM_COMMAND_MENU_VISUAL.descriptionLineHeight,
  },
  meta: {
    maxWidth: 150,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'right',
  },
});
