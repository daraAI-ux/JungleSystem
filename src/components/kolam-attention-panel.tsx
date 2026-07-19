import React from 'react';
import type {AttentionPanelItem} from '../domain/attention-panel';
import {KolamAttentionPanelHeader} from './kolam-attention-panel-header';
import {KolamAttentionPanelList} from './kolam-attention-panel-list';
import {KolamPanelFrame} from './kolam-panel-frame';

export function KolamAttentionPanel({
  items,
  unreadCount,
  onClose,
  onSeeAll,
}: {
  items: AttentionPanelItem[];
  unreadCount: number;
  onClose: () => void;
  onSeeAll: () => void;
}) {
  return (
    <KolamPanelFrame variant="attention">
      <KolamAttentionPanelHeader
        unreadCount={unreadCount}
        onClose={onClose}
        onSeeAll={onSeeAll}
      />
      <KolamAttentionPanelList items={items} />
    </KolamPanelFrame>
  );
}