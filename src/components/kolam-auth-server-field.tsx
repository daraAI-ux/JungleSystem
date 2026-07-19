import React from 'react';
import {KolamFormTextField} from './kolam-form-text-field';
import {authPanelStyles as styles} from './kolam-auth-panel-styles';

export function KolamAuthServerField({
  amApiBaseUrl,
  onAmApiBaseUrlChange,
}: {
  amApiBaseUrl: string;
  onAmApiBaseUrlChange: (value: string) => void;
}) {
  return (
    <KolamFormTextField
      value={amApiBaseUrl}
      onChangeText={onAmApiBaseUrlChange}
      mode="url"
      placeholder="URL server AM existing"
      style={styles.authInputWide}
    />
  );
}
