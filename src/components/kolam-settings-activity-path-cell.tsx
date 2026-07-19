import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {settingsActivityTableStyles as styles} from './kolam-settings-activity-table-styles';

export function KolamSettingsActivityPathCell({
  path,
  event,
}: {
  path: string;
  event: string;
}) {
  return (
    <KolamInlineFrame variant="settingsActivityPathCell">
      <KolamCopyStack
        items={[
          {
            id: 'path',
            text: path,
            style: styles.settingsActivityTablePathText,
            textProps: {numberOfLines: 1},
          },
          {
            id: 'event',
            text: event,
            style: styles.settingsActivityTableEventText,
            textProps: {numberOfLines: 1},
          },
        ]}
      />
    </KolamInlineFrame>
  );
}