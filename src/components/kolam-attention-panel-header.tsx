import React from 'react';
import {getAttentionPanelHeaderActions} from '../domain/attention-panel';
import {KolamAttentionPanelActions} from './kolam-attention-panel-actions';
import {KolamAttentionPanelTitleBlock} from './kolam-attention-panel-title-block';
import {KolamHeaderFrame} from './kolam-header-frame';

export function KolamAttentionPanelHeader({
  unreadCount,
  onClose,
  onSeeAll,
}: {
  unreadCount: number;
  onClose: () => void;
  onSeeAll: () => void;
}) {
  return (
    <KolamHeaderFrame variant="attentionPanel">
      <KolamAttentionPanelTitleBlock />
      <KolamAttentionPanelActions
        actions={getAttentionPanelHeaderActions(unreadCount)}
        onClose={onClose}
        onSeeAll={onSeeAll}
      />
    </KolamHeaderFrame>
  );
}