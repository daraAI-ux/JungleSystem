import React from 'react';
import type {SettingsRoleTabItem} from '../domain/settings-surface';
import {KolamMappedControlTabList} from './kolam-mapped-control-tab-list';

export function KolamSettingsRoleTabList({
  items,
  selectedRoleId,
  onSelectRole,
}: {
  items: SettingsRoleTabItem[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
}) {
  return (
    <KolamMappedControlTabList
      accessibilityLabel="settings/role-management role tabs"
      items={items}
      getItem={tab => ({
        count: tab.permissionCount,
        flag: tab.fullAccess ? 'Full' : tab.defaultRole ? 'Default' : undefined,
        id: tab.id,
        label: tab.label,
      })}
      selectedId={selectedRoleId}
      onSelect={onSelectRole}
    />
  );
}
