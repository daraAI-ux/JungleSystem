import React from 'react';
import type {SettingsDetailRow} from '../domain/settings-surface';
import {KolamDetailValueRow} from './kolam-detail-value-row';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamSettingsDetailRowsSurface({
  rows,
}: {
  rows: SettingsDetailRow[];
}) {
  return (
    <KolamMappedList
      items={rows}
      getKey={row => row.id}
      renderItem={row => (
        <KolamDetailValueRow
          label={row.label}
          meta={row.meta}
          tone={row.tone}
          value={row.value}
        />
      )}
    />
  );
}
