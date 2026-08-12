import React from 'react';
import {KolamSaveButton} from './kolam-save-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamHeaderFrame } from './kolam-header-frame';
import { settingsWebFormStyles as styles } from './kolam-settings-web-form-styles';

export function KolamSettingsWebFormHeader() {
  return (
    <KolamHeaderFrame variant="settingsWebFormHeader">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Form Pengaturan Web',
            style: styles.settingsWebFormTitle,
          },
          {
            id: 'description',
            text: 'Preview FormSection live dari websetting-page.tsx',
            style: styles.settingsWebFormDescription,
          },
        ]}
      />
      <KolamSaveButton label="Simpan" intent="primary" />
    </KolamHeaderFrame>
  );
}
