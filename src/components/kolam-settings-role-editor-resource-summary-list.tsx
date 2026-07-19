import React from 'react';
import type {SettingsRoleResourceGroup} from '../domain/settings-surface';
import {KolamMappedSummaryCardList} from './kolam-mapped-summary-card-list';

export function KolamSettingsRoleEditorResourceSummaryList({
  resourceGroups,
}: {
  resourceGroups: SettingsRoleResourceGroup[];
}) {
  return (
    <KolamMappedSummaryCardList
      accessibilityLabel="settings role resource summary"
      variant="compact"
      items={resourceGroups}
      getItem={group => ({
        id: group.id,
        meta: `${group.resources.length} resources`,
        title: group.label,
      })}
    />
  );
}
