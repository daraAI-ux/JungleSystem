import type {StyleProp, TextStyle} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {SettingsActivityLogTableColumn} from '../domain/settings-surface';
import {getKolamTableVisualContract} from '../domain/kolam-table';

export const KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL =
  getKolamTableVisualContract();

export const KOLAM_SETTINGS_ACTIVITY_HEADER_TEXT = {
  color: V.colors.mutedFg,
  fontFamily: V.fontFamily,
  fontSize: KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.header.fontSize,
  lineHeight: KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.header.lineHeight,
  fontWeight:
    KOLAM_SETTINGS_ACTIVITY_TABLE_VISUAL.header.fontWeight === 'medium'
      ? '500'
      : '700',
} satisfies TextStyle;

export function getSettingsActivityColumnStyle(
  column: SettingsActivityLogTableColumn,
): StyleProp<TextStyle> {
  if (column.width === 'flex') {
    return {flex: 1};
  }

  return {width: column.width};
}

export function getSettingsActivityStatusIntent(
  tone: 'success' | 'warning' | 'muted',
) {
  return tone === 'success'
    ? 'success'
    : tone === 'warning'
      ? 'warning'
      : 'muted';
}
