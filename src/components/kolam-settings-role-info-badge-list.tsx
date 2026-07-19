import React from 'react';
import {KolamBadge} from './kolam-badge';
import {KolamMappedList} from './kolam-mapped-list';
import type {SettingsRoleInfoPanel} from '../domain/settings-surface';

export function KolamSettingsRoleInfoBadgeList({
  badges,
}: {
  badges: SettingsRoleInfoPanel['badges'];
}) {
  return (
    <KolamMappedList
      items={badges}
      getKey={badge => badge.id}
      renderItem={badge => (
        <KolamBadge
          label={badge.label}
          intent={badge.tone === 'warning' ? 'warning' : 'secondary'}
        />
      )}
    />
  );
}
