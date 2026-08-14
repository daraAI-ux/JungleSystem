import React from 'react';
import type {
  SettingsRoleEditorAction,
  SettingsRoleEditorActionId,
  SettingsRoleMemberPreview,
  SettingsRolePermissionMatrixGroup,
  SettingsRolePermissionPreviewRow,
} from '../domain/settings-surface';
import {KolamListFrame} from './kolam-list-frame';
import {KolamSettingsRoleEditorHeader} from './kolam-settings-role-editor-header';
import {KolamSettingsRoleEditorPermissionPreviewList} from './kolam-settings-role-editor-permission-preview-list';
import {KolamSettingsRoleMemberPreview} from './kolam-settings-role-member-preview';
import {KolamSettingsRolePermissionMatrix} from './kolam-settings-role-permission-matrix';

export function KolamSettingsRoleEditorToolbar({
  selectedRoleName,
  actions,
  memberPreview,
  permissionRows,
  permissionMatrixGroups,
  onAction = noopRoleEditorAction,
  onTogglePermissionAction,
}: {
  selectedRoleName: string;
  actions: SettingsRoleEditorAction[];
  memberPreview: SettingsRoleMemberPreview;
  permissionRows: SettingsRolePermissionPreviewRow[];
  permissionMatrixGroups: SettingsRolePermissionMatrixGroup[];
  onAction?: (actionId: SettingsRoleEditorActionId) => void;
  onTogglePermissionAction?: (resource: string, action: string) => void;
}) {
  return (
    <KolamListFrame variant="roleEditorToolbar">
      <KolamSettingsRoleEditorHeader
        actions={actions}
        onAction={onAction}
        selectedRoleName={selectedRoleName}
      />
      <KolamSettingsRoleMemberPreview preview={memberPreview} />
      <KolamSettingsRolePermissionMatrix
        groups={permissionMatrixGroups}
        onTogglePermissionAction={onTogglePermissionAction}
      />
      <KolamSettingsRoleEditorPermissionPreviewList rows={permissionRows} />
    </KolamListFrame>
  );
}

function noopRoleEditorAction() {}
