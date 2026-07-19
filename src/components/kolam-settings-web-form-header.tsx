import React from 'react';
import {KolamActionControlButton} from './kolam-action-control-button';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {settingsWebFormStyles as styles} from './kolam-settings-web-form-styles';

export function KolamSettingsWebFormHeader() {
  return (
    <KolamHeaderFrame variant="settingsWebFormHeader">
      <KolamCopyStack
        items={[
          {
            id: 'title',
            text: 'Web Settings form',
            style: styles.settingsWebFormTitle,
          },
          {
            id: 'description',
            text: 'Live FormSection preview from websetting-page.tsx',
            style: styles.settingsWebFormDescription,
          },
        ]}
      />
      <KolamActionControlButton label="Save" intent="primary" />
    </KolamHeaderFrame>
  );
}