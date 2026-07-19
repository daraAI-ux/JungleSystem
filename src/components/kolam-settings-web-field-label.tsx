import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsWebFormStyles as styles} from './kolam-settings-web-form-styles';

export function KolamSettingsWebFieldLabel({
  label,
  required,
}: {
  label: string;
  required: boolean;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'label',
          text: [label, required ? ' *' : ''],
          style: styles.settingsWebFormFieldLabel,
        },
      ]}
    />
  );
}
