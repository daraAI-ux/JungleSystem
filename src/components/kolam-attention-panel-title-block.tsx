import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {attentionPanelStyles as styles} from './kolam-attention-panel-styles';

export function KolamAttentionPanelTitleBlock() {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'title',
          text: 'Notifications',
          style: styles.attentionPanelTitle,
        },
      ]}
    />
  );
}
