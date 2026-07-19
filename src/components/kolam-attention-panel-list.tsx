import React from 'react';
import type {AttentionPanelItem} from '../domain/attention-panel';
import {KolamAttentionPanelItem} from './kolam-attention-panel-item';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamAttentionPanelList({
  items,
}: {
  items: AttentionPanelItem[];
}) {
  return (
    <KolamListFrame variant="attentionList">
      <KolamMappedList
        items={items}
        limit={8}
        getKey={item => item.id}
        renderItem={item => <KolamAttentionPanelItem item={item} />}
      />
    </KolamListFrame>
  );
}