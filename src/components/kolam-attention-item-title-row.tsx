import React from 'react';
import {KolamAttentionUnreadDot} from './kolam-attention-unread-dot';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {attentionPanelStyles as styles} from './kolam-attention-panel-styles';

export function KolamAttentionItemTitleRow({
  label,
  isUnread,
}: {
  label: string;
  isUnread: boolean;
}) {
  return (
    <KolamInlineFrame variant="attentionItemTitleRow">
      <KolamCopyStack
        items={[
          {id: 'title', text: label, style: styles.attentionItemTitle},
        ]}
      />
      {isUnread ? <KolamAttentionUnreadDot /> : null}
    </KolamInlineFrame>
  );
}