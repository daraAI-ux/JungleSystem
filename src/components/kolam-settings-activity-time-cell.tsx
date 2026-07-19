import React from 'react';
import type {SettingsActivityLogRow} from '../domain/settings-surface';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamWarningIcon} from './kolam-warning-icon';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivityTimeCell({
  row,
}: {
  row: SettingsActivityLogRow;
}) {
  return (
    <KolamInlineFrame variant="settingsActivityTimeCell">
      <KolamInlineFrame variant="settingsActivityTimeLine">
        {row.suspicious.length > 0 ? <KolamWarningIcon /> : null}
        <KolamCopyStack
          items={[
            {
              id: 'time',
              text: row.timestamp,
              style: styles.settingsActivityTableSmallText,
            },
          ]}
        />
      </KolamInlineFrame>
    </KolamInlineFrame>
  );
}