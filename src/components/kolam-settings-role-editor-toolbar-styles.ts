import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const settingsRoleEditorToolbarStyles = StyleSheet.create({
  settingsRoleEditorToolbar: {
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 14,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  settingsRoleEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingsRoleEditorCopy: {
    flex: 1,
    minWidth: 0,
  },
  settingsRoleEditorTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  settingsRoleEditorMeta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  settingsRoleEditorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
