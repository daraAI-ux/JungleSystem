import React from 'react';
import type {SettingsActivityLogRow} from '../domain/settings-surface';
import {KolamRowFrame} from './kolam-row-frame';
import {KolamSettingsActivityActionCell} from './kolam-settings-activity-action-cell';
import {KolamSettingsActivityDurationCell} from './kolam-settings-activity-duration-cell';
import {KolamSettingsActivityIpCell} from './kolam-settings-activity-ip-cell';
import {KolamSettingsActivityMethodCell} from './kolam-settings-activity-method-cell';
import {KolamSettingsActivityPathCell} from './kolam-settings-activity-path-cell';
import {KolamSettingsActivitySourceCell} from './kolam-settings-activity-source-cell';
import {KolamSettingsActivityStatusCell} from './kolam-settings-activity-status-cell';
import {KolamSettingsActivityTimeCell} from './kolam-settings-activity-time-cell';
import {KolamSettingsActivityTypeCell} from './kolam-settings-activity-type-cell';
import {KolamSettingsActivityUserCell} from './kolam-settings-activity-user-cell';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivityTableRow({
  row,
  isActive,
  isLast,
  onSelectRow,
}: {
  row: SettingsActivityLogRow;
  isActive: boolean;
  isLast: boolean;
  onSelectRow: (rowId: string) => void;
}) {
  return (
    <KolamRowFrame
      variant="settingsActivity"
      style={[
        isLast && styles.settingsActivityTableRowLast,
        isActive && styles.settingsActivityTableRowActive,
        row.suspicious.length > 0 && styles.settingsActivityTableRowWarning,
      ]}>
      <KolamSettingsActivityTimeCell row={row} />
      <KolamSettingsActivityUserCell user={row.user} />
      <KolamSettingsActivitySourceCell source={row.source} />
      <KolamSettingsActivityTypeCell type={row.type} />
      <KolamSettingsActivityMethodCell method={row.method} />
      <KolamSettingsActivityPathCell path={row.path} event={row.event} />
      <KolamSettingsActivityIpCell ip={row.ip} />
      <KolamSettingsActivityStatusCell
        statusCode={row.statusCode}
        tone={row.tone}
      />
      <KolamSettingsActivityDurationCell duration={row.duration} />
      <KolamSettingsActivityActionCell row={row} onSelectRow={onSelectRow} />
    </KolamRowFrame>
  );
}