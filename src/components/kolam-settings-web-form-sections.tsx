import React from 'react';
import type { SettingsWebFormSection } from '../domain/settings-surface';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamMappedList } from './kolam-mapped-list';
import { KolamSettingsWebFormHeader } from './kolam-settings-web-form-header';
import { KolamSettingsWebFormSection } from './kolam-settings-web-form-section';

export function KolamSettingsWebFormSections({
  onUploadFile,
  sections,
}: {
  onUploadFile?: () => void;
  sections: SettingsWebFormSection[];
}) {
  return (
    <KolamContentFrame variant="settingsWebFormSections">
      <KolamSettingsWebFormHeader />
      <KolamMappedList
        items={sections}
        getKey={section => section.id}
        renderItem={(section, index) => (
          <KolamSettingsWebFormSection
            onUploadFile={onUploadFile}
            section={section}
            showSeparator={index > 0}
          />
        )}
      />
    </KolamContentFrame>
  );
}
