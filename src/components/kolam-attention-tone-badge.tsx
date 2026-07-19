import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {AttentionPanelItem} from '../domain/attention-panel';
import {attentionPanelStyles as styles} from './kolam-attention-panel-styles';

export function KolamAttentionToneBadge({
  tone,
}: {
  tone: AttentionPanelItem['tone'];
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'tone',
          text: tone.toUpperCase(),
          style: [
            styles.attentionTone,
            tone === 'success' && styles.attentionToneSuccess,
            tone === 'warning' && styles.attentionToneWarning,
            tone === 'danger' && styles.attentionToneDanger,
          ],
        },
      ]}
    />
  );
}
