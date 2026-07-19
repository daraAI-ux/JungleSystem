import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsRoleEditorToolbarStyles as styles} from './kolam-settings-role-editor-toolbar-styles';

export function KolamSettingsRoleEditorTitleCopy({
  selectedRoleName,
}: {
  selectedRoleName: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.settingsRoleEditorCopy}
      items={[
        {
          id: 'title',
          text: 'Role editor actions',
          style: styles.settingsRoleEditorTitle,
        },
        {
          id: 'meta',
          text: `Selected: ${selectedRoleName}`,
          style: styles.settingsRoleEditorMeta,
        },
      ]}
    />
  );
}
