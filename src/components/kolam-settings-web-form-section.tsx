import React from 'react';
import {View} from 'react-native';
import type {SettingsWebFormSection} from '../domain/settings-surface';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamSettingsWebFormFields} from './kolam-settings-web-form-fields';
import {KolamSettingsWebFormSectionHeader} from './kolam-settings-web-form-section-header';
import {settingsWebFormStyles as styles} from './kolam-settings-web-form-styles';

export function KolamSettingsWebFormSection({
  section,
  showSeparator,
}: {
  section: SettingsWebFormSection;
  showSeparator: boolean;
}) {
  return (
    <KolamContentFrame variant="settingsWebFormSection">
      {showSeparator ? <View style={styles.settingsWebSeparator} /> : null}
      <KolamSettingsWebFormSectionHeader
        title={section.title}
        description={section.description}
      />
      <KolamSettingsWebFormFields
        fields={section.fields}
        layout={section.layout}
      />
    </KolamContentFrame>
  );
}