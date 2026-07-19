import React from 'react';
import type {
  SettingsWebConfigField,
  SettingsWebFormSection,
} from '../domain/settings-surface';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamSettingsWebFormSections} from './kolam-settings-web-widgets';
import {KolamTextFieldRow} from './kolam-text-field-row';
import {KolamToggleRow} from './kolam-toggle-row';

export function KolamSettingsWebConfigSurface({
  fields,
  maintenanceMode,
  onToggleMaintenanceMode,
  onToggleStorefrontEnabled,
  onWebTitleChange,
  sections,
  storefrontEnabled,
  webTitle,
}: {
  fields: SettingsWebConfigField[];
  maintenanceMode: boolean;
  onToggleMaintenanceMode: () => void;
  onToggleStorefrontEnabled: () => void;
  onWebTitleChange: (value: string) => void;
  sections: SettingsWebFormSection[];
  storefrontEnabled: boolean;
  webTitle: string;
}) {
  return (
    <KolamContentFrame variant="settingsWebConfig">
      <KolamTextFieldRow
        label={fields[0].label}
        description={fields[0].description}
        value={webTitle}
        onChangeText={onWebTitleChange}
        placeholder="Storefront title"
      />
      <KolamToggleRow
        label={fields[1].label}
        description={fields[1].description}
        active={storefrontEnabled}
        onPress={onToggleStorefrontEnabled}
      />
      <KolamToggleRow
        label={fields[2].label}
        description={fields[2].description}
        active={maintenanceMode}
        onPress={onToggleMaintenanceMode}
      />
      <KolamSettingsWebFormSections sections={sections} />
    </KolamContentFrame>
  );
}