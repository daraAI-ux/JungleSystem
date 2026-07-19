import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  KOLAM_SETTINGS_ACTIVITY_HEADER_TEXT,
  KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL,
} from './kolam-settings-activity-table-visual';

export const settingsActivityTableStyles = StyleSheet.create({
  settingsActivityTable: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  settingsActivityTableHeader: {
    minHeight: KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.body.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal:
      KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.header.columnPaddingX,
    paddingVertical: KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.header.gutterY,
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  settingsActivityTableHeaderText: {
    ...KOLAM_SETTINGS_ACTIVITY_HEADER_TEXT,
  },
  settingsActivityTableRow: {
    minHeight: KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.body.rowMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.body.cellPaddingX,
    paddingVertical: KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.body.gutterY,
    borderBottomColor: V.colors.border,
    borderBottomWidth:
      KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.body.rowBorderBottom ? 1 : 0,
    backgroundColor: V.colors.bg,
  },
  settingsActivityTableRowWarning: {
    backgroundColor: V.colors.warningSoft,
  },
  settingsActivityTableRowLast: {
    borderBottomWidth: 0,
  },
  settingsActivityTableRowActive: {
    borderLeftColor: V.colors.primary,
    borderLeftWidth: 3,
    backgroundColor:
      KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.interaction
        .resolvedSelectedBackground,
  },
  settingsActivityTableTimeCell: {
    width: 92,
  },
  settingsActivityTimeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  settingsActivityTableSmallText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  settingsActivityTableUserCell: {
    width: 112,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  settingsActivityTableSourceCell: {
    width: 84,
  },
  settingsActivityTableTypeCell: {
    width: 68,
  },
  settingsActivityTableMethodCell: {
    width: 78,
  },
  settingsActivityTablePathCell: {
    flex: 1,
    minWidth: 130,
  },
  settingsActivityTablePathText: {
    color: V.colors.fg,
    fontFamily: 'Consolas',
    fontSize: 11,
    fontWeight: '800',
  },
  settingsActivityTableEventText: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
  },
  settingsActivityTableIpCell: {
    width: 72,
    color: V.colors.mutedFg,
    fontFamily: 'Consolas',
    fontSize: 11,
  },
  settingsActivityTableStatusCell: {
    width: 78,
  },
  settingsActivityTableDurationCell: {
    width: 68,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  settingsActivityTableActionCell: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
