import React from 'react';
import {KolamBadge} from './kolam-badge';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamSettingsRoleFlagBadges({
  flags,
}: {
  flags: boolean[];
}) {
  return (
    <KolamMappedList
      items={flags}
      getKey={(_active, index) => index}
      renderItem={active => (
        <KolamBadge
          label={active ? 'yes' : '-'}
          intent={active ? 'success' : 'muted'}
          align="center"
          horizontalPadding={0}
          weight="900"
          width={58}
        />
      )}
    />
  );
}
