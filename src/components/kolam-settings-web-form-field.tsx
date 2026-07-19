import React from 'react';
import {View} from 'react-native';
import type {SettingsWebFormSection} from '../domain/settings-surface';
import {KolamSettingsWebFieldControl} from './kolam-settings-web-field-control';
import {KolamSettingsWebFieldLabel} from './kolam-settings-web-field-label';
import {settingsWebFormStyles as styles} from './kolam-settings-web-form-styles';

export type SettingsWebField = SettingsWebFormSection['fields'][number];

export function KolamSettingsWebFormField({
  field,
}: {
  field: SettingsWebField;
}) {
  return (
    <View
      style={[
        styles.settingsWebFormField,
        field.control === 'textarea' && styles.settingsWebFormFieldTextarea,
      ]}>
      <KolamSettingsWebFieldLabel
        label={field.label}
        required={field.required}
      />
      <KolamSettingsWebFieldControl field={field} />
    </View>
  );
}
