import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const settingsRoleManagementStyles = StyleSheet.create({
  settingsRoleMatrix: {
    overflow: 'hidden',
    backgroundColor: V.colors.bg,
  },
  settingsRoleHeader: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: V.layout.tableCellPaddingX,
    backgroundColor: V.colors.muted,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  settingsRoleHeaderText: {
    flex: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  settingsRoleFlagHeader: {
    width: 58,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  settingsRoleForm: {
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.bg,
  },
  settingsRoleFormGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  settingsRoleFormField: {
    minWidth: 210,
    flex: 1,
    gap: 6,
  },
  settingsRoleFormFieldWide: {
    minWidth: 260,
    flex: 1.4,
    gap: 6,
  },
  settingsRoleInput: {
    minHeight: 38,
    borderColor: V.colors.border,
    borderWidth: 1,
    borderRadius: V.radius.md,
    paddingHorizontal: 10,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    backgroundColor: V.colors.bg,
  },
  settingsRoleMessage: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  settingsRoleMessageError: {
    color: V.colors.warning,
  },
});
