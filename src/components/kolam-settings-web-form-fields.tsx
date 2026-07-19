import React from 'react';
import {View} from 'react-native';
import type {SettingsWebFormSection} from '../domain/settings-surface';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSettingsWebFormField} from './kolam-settings-web-form-field';
import {settingsWebFormStyles as styles} from './kolam-settings-web-form-styles';

type SettingsWebField = SettingsWebFormSection['fields'][number];

export function KolamSettingsWebFormFields({
  fields,
  layout,
}: {
  fields: SettingsWebField[];
  layout: SettingsWebFormSection['layout'];
}) {
  return (
    <View
      style={[
        styles.settingsWebFormFields,
        layout === 'grid-2' && styles.settingsWebFormFieldsGrid,
      ]}>
      <KolamMappedList
        items={fields}
        getKey={field => field.id}
        renderItem={field => <KolamSettingsWebFormField field={field} />}
      />
    </View>
  );
}
