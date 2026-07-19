import React from 'react';
import type {AttentionPanelItem} from '../domain/attention-panel';
import {KolamAttentionItemTitleRow} from './kolam-attention-item-title-row';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {attentionPanelStyles as styles} from './kolam-attention-panel-styles';

export function KolamAttentionItemCopy({item}: {item: AttentionPanelItem}) {
  return (
    <KolamInlineFrame variant="attentionItemCopy">
      <KolamAttentionItemTitleRow
        label={item.label}
        isUnread={item.isUnread}
      />
      <KolamCopyStack
        items={[
          {
            id: 'message',
            text: item.message,
            style: styles.attentionItemMessage,
          },
          {id: 'meta', text: item.meta, style: styles.attentionItemMeta},
        ]}
      />
    </KolamInlineFrame>
  );
}