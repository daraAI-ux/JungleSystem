import React from 'react';
import {
  getAttentionPanelCloseAction,
  getAttentionPanelHeaderActions,
} from '../domain/attention-panel';
import {KolamAttentionHeaderAction} from './kolam-attention-header-action';
import {KolamIconButton} from './kolam-icon-button';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamXIcon} from './kolam-x-icon';

const ATTENTION_CLOSE_ACTION = getAttentionPanelCloseAction();

export function KolamAttentionPanelActions({
  actions,
  onClose,
  onSeeAll,
}: {
  actions: ReturnType<typeof getAttentionPanelHeaderActions>;
  onClose: () => void;
  onSeeAll: () => void;
}) {
  return (
    <KolamListFrame variant="attentionActions">
      <KolamMappedList
        items={actions}
        getKey={action => action.id}
        renderItem={action => (
          <KolamAttentionHeaderAction action={action} onSeeAll={onSeeAll} />
        )}
      />
      <KolamIconButton
        accessibilityLabel={ATTENTION_CLOSE_ACTION.label}
        onPress={onClose}>
        <KolamXIcon />
      </KolamIconButton>
    </KolamListFrame>
  );
}