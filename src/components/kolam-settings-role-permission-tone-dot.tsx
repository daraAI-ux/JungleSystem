import React from 'react';
import {View} from 'react-native';
import type {SettingsRolePermissionMatrixGroup} from '../domain/settings-surface';
import {settingsRolePermissionMatrixStyles as styles} from './kolam-settings-role-permission-matrix-styles';

type PermissionRow = SettingsRolePermissionMatrixGroup['rows'][number];

export function KolamSettingsRolePermissionToneDot({
  tone,
}: {
  tone: PermissionRow['tone'];
}) {
  return (
    <View
      style={[
        styles.settingsRolePermissionMatrixDot,
        tone === 'success' && styles.settingsRolePermissionMatrixDotSuccess,
        tone === 'warning' && styles.settingsRolePermissionMatrixDotWarning,
      ]}
    />
  );
}
