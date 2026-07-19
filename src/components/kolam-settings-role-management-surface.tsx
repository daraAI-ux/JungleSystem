import React from 'react';
import type {
  SettingsRoleAccessRow,
  SettingsRoleEditorAction,
  SettingsRoleInfoPanel as SettingsRoleInfoPanelDescriptor,
  SettingsRoleMemberPreview,
  SettingsRolePermissionMatrixGroup,
  SettingsRolePermissionPreviewRow,
  SettingsRoleResourceGroup,
  SettingsRoleTabItem,
} from '../domain/settings-surface';
import {KolamCardFrame} from './kolam-card-frame';
import {
  KolamSettingsRoleEditorToolbar,
  KolamSettingsRoleInfoPanel,
} from './kolam-settings-role-widgets';
import {KolamSettingsRoleTabList} from './kolam-settings-role-tab-list';
import {KolamSettingsRoleTable} from './kolam-settings-role-table';

export function KolamSettingsRoleManagementSurface({
  roleEditorActions,
  roleInfoPanel,
  roleMemberPreview,
  rolePermissionMatrixGroups,
  rolePermissionPreviewRows,
  roleResourceGroups,
  roleRows,
  roleTabItems,
  selectedRole,
  selectedRoleId,
  onSelectRole,
}: {
  roleEditorActions: SettingsRoleEditorAction[];
  roleInfoPanel: SettingsRoleInfoPanelDescriptor;
  roleMemberPreview: SettingsRoleMemberPreview;
  rolePermissionMatrixGroups: SettingsRolePermissionMatrixGroup[];
  rolePermissionPreviewRows: SettingsRolePermissionPreviewRow[];
  roleResourceGroups: SettingsRoleResourceGroup[];
  roleRows: SettingsRoleAccessRow[];
  roleTabItems: SettingsRoleTabItem[];
  selectedRole?: SettingsRoleAccessRow;
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
}) {
  return (
    <KolamCardFrame variant="settingsRoleMatrix">
      <KolamSettingsRoleTabList
        items={roleTabItems}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
      />
      <KolamSettingsRoleInfoPanel info={roleInfoPanel} />
      <KolamSettingsRoleEditorToolbar
        selectedRoleName={selectedRole?.role ?? 'Role'}
        actions={roleEditorActions}
        memberPreview={roleMemberPreview}
        permissionRows={rolePermissionPreviewRows}
        permissionMatrixGroups={rolePermissionMatrixGroups}
        resourceGroups={roleResourceGroups}
      />
      <KolamSettingsRoleTable
        rows={roleRows}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
      />
    </KolamCardFrame>
  );
}