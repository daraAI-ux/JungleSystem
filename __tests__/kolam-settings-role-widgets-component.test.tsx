import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamSettingsRoleEditorToolbar,
  KolamSettingsRoleInfoPanel,
} from '../src/components/kolam-settings-role-widgets';
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
});
