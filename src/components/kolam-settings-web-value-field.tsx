import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {SettingsWebField} from './kolam-settings-web-form-field';
import {settingsWebFormStyles as styles} from './kolam-settings-web-form-styles';

export function KolamSettingsWebValueField({
  field,
}: {
  field: SettingsWebField;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'value',
          text: field.value || field.placeholder,
          style: [
            styles.settingsWebFormFieldValue,
            field.control === 'textarea' &&
              styles.settingsWebFormFieldValueTextarea,
          ],
          textProps: {numberOfLines: field.control === 'textarea' ? 2 : 1},
        },
      ]}
    />
  );
}
