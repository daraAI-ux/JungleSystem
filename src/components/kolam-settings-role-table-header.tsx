import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsRoleManagementStyles as styles} from './kolam-settings-role-management-styles';

export function KolamSettingsRoleTableHeader() {
  return (
    <KolamCopyStack
      containerStyle={styles.settingsRoleHeader}
      items={[
        {id: 'role', text: 'Role', style: styles.settingsRoleHeaderText},
        {id: 'kolam', text: 'Kolam', style: styles.settingsRoleFlagHeader},
        {id: 'pos', text: 'POS', style: styles.settingsRoleFlagHeader},
        {id: 'am', text: 'AM', style: styles.settingsRoleFlagHeader},
      ]}
    />
  );
}
