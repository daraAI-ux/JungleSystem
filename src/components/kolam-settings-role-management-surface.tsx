import React from 'react';
import {Text, View} from 'react-native';
import type {
  SettingsRoleAccessRow,
  SettingsRoleEditorAction,
  SettingsRoleEditorActionId,
  SettingsRoleInfoPanel as SettingsRoleInfoPanelDescriptor,
  SettingsRoleMemberPreview,
  SettingsRolePermissionMatrixGroup,
  SettingsRolePermissionPreviewRow,
  SettingsRoleResourceGroup,
  SettingsRoleTabItem,
} from '../domain/settings-surface';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamSettingsWebFieldLabel} from './kolam-settings-web-field-label';
import {
  KolamSettingsRoleEditorToolbar,
  KolamSettingsRoleInfoPanel,
} from './kolam-settings-role-widgets';
import {settingsRoleManagementStyles as styles} from './kolam-settings-role-management-styles';
import {KolamSettingsRoleTabList} from './kolam-settings-role-tab-list';
import {KolamSettingsRoleTable} from './kolam-settings-role-table';

export function KolamSettingsRoleManagementSurface({
  draft = emptyRoleSurfaceDraft,
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
  saveMessage = '',
  saveStatus = 'idle',
  setDraftField = noopSetRoleDraftField,
  onAction = noopRoleAction,
  onSelectRole,
  onTogglePermissionAction = noopTogglePermissionAction,
}: {
  draft?: {
    name: string;
    key: string;
    description: string;
  };
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
  saveMessage?: string;
  saveStatus?: 'idle' | 'loading' | 'saving' | 'saved' | 'error';
  setDraftField?: (
    key: 'name' | 'key' | 'description',
    value: string,
  ) => void;
  onAction?: (actionId: SettingsRoleEditorActionId) => void;
  onSelectRole: (roleId: string) => void;
  onTogglePermissionAction?: (resource: string, action: string) => void;
}) {
  return (
    <KolamCardFrame variant="settingsRoleMatrix">
      <KolamSettingsRoleTabList
        items={roleTabItems}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
      />
      <KolamSettingsRoleInfoPanel info={roleInfoPanel} />
      <View style={styles.settingsRoleForm}>
        <View style={styles.settingsRoleFormGrid}>
          <View style={styles.settingsRoleFormField}>
            <KolamSettingsWebFieldLabel label="Role name" required />
            <KolamFormTextField
              value={draft.name}
              onChangeText={value => setDraftField('name', value)}
              placeholder="Warehouse Staff"
              style={styles.settingsRoleInput}
            />
          </View>
          <View style={styles.settingsRoleFormField}>
            <KolamSettingsWebFieldLabel label="Role key" required />
            <KolamFormTextField
              mode="text"
              value={draft.key}
              onChangeText={value => setDraftField('key', value)}
              placeholder="warehouse-staff"
              style={styles.settingsRoleInput}
            />
          </View>
          <View style={styles.settingsRoleFormFieldWide}>
            <KolamSettingsWebFieldLabel label="Description" required={false} />
            <KolamFormTextField
              value={draft.description}
              onChangeText={value => setDraftField('description', value)}
              placeholder="Brief role description"
              style={styles.settingsRoleInput}
            />
          </View>
        </View>
        {saveMessage ? (
          <Text
            style={[
              styles.settingsRoleMessage,
              saveStatus === 'error' && styles.settingsRoleMessageError,
            ]}>
            {saveMessage}
          </Text>
        ) : null}
      </View>
      <KolamSettingsRoleEditorToolbar
        selectedRoleName={selectedRole?.role ?? 'Role'}
        actions={roleEditorActions}
        memberPreview={roleMemberPreview}
        permissionRows={rolePermissionPreviewRows}
        permissionMatrixGroups={rolePermissionMatrixGroups}
        resourceGroups={roleResourceGroups}
        onAction={onAction}
        onTogglePermissionAction={onTogglePermissionAction}
      />
      <KolamSettingsRoleTable
        rows={roleRows}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
      />
    </KolamCardFrame>
  );
}

const emptyRoleSurfaceDraft = {
  name: '',
  key: '',
  description: '',
};

function noopSetRoleDraftField() {}

function noopRoleAction() {}

function noopTogglePermissionAction() {}
