import React from 'react';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamSwitch} from './kolam-switch';
import type {SettingsWebField} from './kolam-settings-web-form-field';
import {settingsWebFormStyles as styles} from './kolam-settings-web-form-styles';

export function KolamSettingsWebSwitchField({
  field,
}: {
  field: SettingsWebField;
}) {
  return (
    <KolamCardFrame variant="settingsWebSwitchRow">
      <KolamCopyStack
        items={[
          {
            id: 'hint',
            text: field.placeholder,
            style: styles.settingsWebFormFieldHint,
          },
        ]}
      />
      <KolamSwitch
        active={field.value === 'true'}
        disabled
        onPress={() => undefined}
      />
    </KolamCardFrame>
  );
}