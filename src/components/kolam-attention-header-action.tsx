import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {getAttentionPanelHeaderActions} from '../domain/attention-panel';
import {KolamTextAction} from './kolam-text-action';
import {attentionPanelStyles as styles} from './kolam-attention-panel-styles';

type AttentionHeaderAction = ReturnType<
  typeof getAttentionPanelHeaderActions
>[number];

export function KolamAttentionHeaderAction({
  action,
  onSeeAll,
}: {
  action: AttentionHeaderAction;
  onSeeAll: () => void;
}) {
  if (action.id === 'unread') {
    return (
      <KolamCopyStack
        items={[
          {
            id: 'unread',
            text: action.label,
            style: styles.attentionPanelUnread,
          },
        ]}
      />
    );
  }

  return <KolamTextAction label={action.label} onPress={onSeeAll} />;
}
