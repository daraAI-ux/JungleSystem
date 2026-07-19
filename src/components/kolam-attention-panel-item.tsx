import React from 'react';
import {View} from 'react-native';
import type {AttentionPanelItem} from '../domain/attention-panel';
import {KolamAttentionItemCopy} from './kolam-attention-item-copy';
import {KolamAttentionToneBadge} from './kolam-attention-tone-badge';
import {attentionPanelStyles as styles} from './kolam-attention-panel-styles';

export function KolamAttentionPanelItem({
  item,
}: {
  item: AttentionPanelItem;
}) {
  return (
    <View
      style={[
        styles.attentionItem,
        item.isUnread && styles.attentionItemUnread,
      ]}>
      <KolamAttentionToneBadge tone={item.tone} />
      <KolamAttentionItemCopy item={item} />
    </View>
  );
}
