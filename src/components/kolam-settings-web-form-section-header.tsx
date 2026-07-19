import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {settingsWebFormStyles as styles} from './kolam-settings-web-form-styles';

export function KolamSettingsWebFormSectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.settingsWebFormSectionHeader}
      items={[
        {
          id: 'title',
          text: title,
          style: styles.settingsWebFormSectionTitle,
        },
        {
          id: 'description',
          text: description,
          style: styles.settingsWebFormSectionDescription,
        },
      ]}
    />
  );
}
