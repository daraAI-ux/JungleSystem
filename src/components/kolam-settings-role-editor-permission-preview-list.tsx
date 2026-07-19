import React from 'react';
import type {SettingsRolePermissionPreviewRow} from '../domain/settings-surface';
import {KolamMappedSummaryCardList} from './kolam-mapped-summary-card-list';

export function KolamSettingsRoleEditorPermissionPreviewList({
  rows,
}: {
  rows: SettingsRolePermissionPreviewRow[];
}) {
  return (
    <KolamMappedSummaryCardList
      accessibilityLabel="settings role permission preview"
      items={rows}
      getItem={row => ({
        badges: row.actions,
        id: row.id,
        meta: row.resource,
        title: row.label,
      })}
    />
  );
}
