import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamSettingsRoleEditorToolbar,
  KolamSettingsRoleInfoPanel,
} from '../src/components/kolam-settings-role-widgets';
import {
  getSettingsRoleAccessRows,
  getSettingsRoleAccessRowsFromLive,
  getSettingsRoleEditorActions,
  getSettingsRoleInfoPanel,
  getSettingsRoleMemberPreview,
  getSettingsRolePermissionMatrixGroups,
  getSettingsRolePermissionPreviewRows,
  getSettingsRoleResourceGroups,
  getSettingsRoleTabItems,
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

describe('settings role widgets', () => {
  it('renders role info and editor toolbar directly', async () => {
    const roleRows = getSettingsRoleAccessRows();
    const selectedRole = roleRows[0];
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
            memberPreview={getSettingsRoleMemberPreview(selectedRole.id)}
            permissionRows={getSettingsRolePermissionPreviewRows()}
            permissionMatrixGroups={getSettingsRolePermissionMatrixGroups(
              selectedRole.id,
              selectedRole.defaultRole,
            )}
            resourceGroups={getSettingsRoleResourceGroups()}
          />
        </View>,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['Role editor actions', selectedRole.role]),
    );
  });

  it('maps live roles with default delete protection and super admin full access', () => {
    const liveRoles = [
      {
        _id: 'role-super',
        name: 'Super Administrator',
        key: 'super-admin',
        permissions: [],
      },
      {
        _id: 'role-staff',
        name: 'Staff',
        key: 'staff',
        permissions: [{resource: 'role', actions: ['view']}],
      },
      {
        _id: 'role-custom',
        name: 'Gudang',
        key: 'gudang',
        permissions: [{resource: 'role', actions: ['view', 'update']}],
      },
    ];

    const rows = getSettingsRoleAccessRowsFromLive(liveRoles);
    const staffActions = getSettingsRoleEditorActions(
      rows[1].id,
      rows[1].defaultRole,
    );
    const tabs = getSettingsRoleTabItems(rows, liveRoles);
    const [superGroup] = getSettingsRolePermissionMatrixGroups(
      liveRoles[0],
      rows[0].defaultRole,
    );

    expect(rows[1]).toEqual(expect.objectContaining({defaultRole: true}));
    expect(staffActions.find(action => action.id === 'delete-role')).toEqual(
      expect.objectContaining({disabled: true}),
    );
    expect(tabs[0]).toEqual(expect.objectContaining({fullAccess: true}));
    expect(
      superGroup.rows.every(row =>
        row.actions.every(action => action.selected && action.disabled),
      ),
    ).toBe(true);
  });
});
