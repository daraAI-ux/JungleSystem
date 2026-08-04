import React from 'react';
import {View} from 'react-native';
import type {AttentionPanelItem} from '../domain/attention-panel';
import {KolamAttentionItemCopy} from './kolam-attention-item-copy';
import {KolamAttentionToneBadge} from './kolam-attention-tone-badge';
import {KolamPressable} from './kolam-pressable';
import {attentionPanelStyles as styles} from './kolam-attention-panel-styles';

export function KolamAttentionPanelItem({
  item,
  onItemPress,
}: {
  item: AttentionPanelItem;
  onItemPress?: (item: AttentionPanelItem) => void;
}) {
  const content = (
    <>
      <KolamAttentionToneBadge label={item.badgeLabel} tone={item.tone} />
      <KolamAttentionItemCopy item={item} />
    </>
  );
  const itemStyle = [
    styles.attentionItem,
    item.isUnread && styles.attentionItemUnread,
  ];

  if (onItemPress && item.routeHint) {
    return (
      <KolamPressable
        accessibilityLabel={item.label}
        onPress={() => onItemPress(item)}
        style={itemStyle}>
        {content}
      </KolamPressable>
    );
  }

  return (
    <View
      style={itemStyle}>
      {content}
    </View>
  );
}
