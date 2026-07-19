import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {surfacePanelStyles as styles} from './kolam-surface-panel-styles';

export function KolamSurfacePanelCopy({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <KolamCopyStack
      items={[
        {id: 'title', text: title, style: styles.title},
        {id: 'description', text: description, style: styles.description},
      ]}
    />
  );
}
