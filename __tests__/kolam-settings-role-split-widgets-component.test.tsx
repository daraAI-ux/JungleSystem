import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSettingsRoleEditorToolbar} from '../src/components/kolam-settings-role-editor-toolbar';
import {KolamSettingsRoleInfoPanel} from '../src/components/kolam-settings-role-info-panel';
import {KolamSettingsRoleMemberPreview} from '../src/components/kolam-settings-role-member-preview';
import {KolamSettingsRolePermissionMatrix} from '../src/components/kolam-settings-role-permission-matrix';
import {
  getSettingsRoleAccessRows,
  getSettingsRoleEditorActions,
  getSettingsRoleInfoPanel,
  getSettingsRoleMemberPreview,
  getSettingsRolePermissionMatrixGroups,
  getSettingsRolePermissionPreviewRows,
  getSettingsRoleResourceGroups,
} from '../src/domain/settings-surface';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('settings role split widgets', () => {
  it('renders direct imports for role info, toolbar, matrix, and member preview', async () => {
    const roleRows = getSettingsRoleAccessRows();
    const selectedRole = roleRows[0];
    const permissionMatrixGroups = getSettingsRolePermissionMatrixGroups(
      selectedRole.id,
      selectedRole.defaultRole,
    );
    const memberPreview = getSettingsRoleMemberPreview(selectedRole.id);
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <View>
          <KolamSettingsRoleInfoPanel
            info={getSettingsRoleInfoPanel(selectedRole.id)}
          />
          <KolamSettingsRoleEditorToolbar
            selectedRoleName={selectedRole.role}
            actions={getSettingsRoleEditorActions(
              selectedRole.id,
              selectedRole.defaultRole,
            )}
            memberPreview={memberPreview}
            permissionRows={getSettingsRolePermissionPreviewRows()}
            permissionMatrixGroups={permissionMatrixGroups}
            resourceGroups={getSettingsRoleResourceGroups()}
          />
          <KolamSettingsRolePermissionMatrix groups={permissionMatrixGroups} />
          <KolamSettingsRoleMemberPreview preview={memberPreview} />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining([
        'Role editor actions',
        selectedRole.role,
        memberPreview.label,
      ]),
    );
  });
});