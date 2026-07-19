import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {statusPanelFrameStyles as styles} from './kolam-status-panel-frame-styles';

export function KolamStatusPanelMeta({meta}: {meta: string}) {
  return (
    <KolamCopyStack
      items={[{id: 'meta', text: meta, style: styles.statusPanelMeta}]}
    />
  );
}
