import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export const settingsRoleInfoPanelStyles = StyleSheet.create({
  settingsRoleInfoPanel: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 12,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.muted,
  },
  settingsRoleInfoCopy: {
    flex: 1,
    minWidth: 0,
  },
  settingsRoleInfoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  settingsRoleInfoTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  settingsRoleInfoDescription: {
    marginTop: 5,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  settingsRoleInfoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsRoleInfoDeleteButton: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
    borderWidth: 1,
  },
  settingsRoleInfoDeleteText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  settingsRoleInfoNotice: {
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 9,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.warningSoft,
  },
  settingsRoleInfoNoticeText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
});
