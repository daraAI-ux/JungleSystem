import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {SettingsActivityLogTableColumn} from '../domain/settings-surface';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';
import {getSettingsActivityColumnStyle} from './kolam-settings-activity-table-visual';

export function KolamSettingsActivityTableHeaderCell({
  column,
}: {
  column: SettingsActivityLogTableColumn;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: column.id,
          text: column.label,
          style: [
            styles.settingsActivityTableHeaderText,
            getSettingsActivityColumnStyle(column),
            column.id === 'path' && styles.settingsActivityTablePathCell,
            column.id === 'detail' && styles.settingsActivityTableActionCell,
          ],
        },
      ]}
    />
  );
}
