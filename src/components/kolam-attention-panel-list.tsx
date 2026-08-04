import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import type {AttentionPanelItem} from '../domain/attention-panel';
import {KolamAttentionPanelItem} from './kolam-attention-panel-item';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamNotificationBellIcon} from './kolam-notification-bell-icon';
import {attentionPanelStyles as styles} from './kolam-attention-panel-styles';

export function KolamAttentionPanelList({
  items,
  onItemPress,
}: {
  items: AttentionPanelItem[];
  onItemPress?: (item: AttentionPanelItem) => void;
}) {
  const isEmptyNotificationList =
    items.length === 1 && items[0]?.id === 'notification-empty';

  if (isEmptyNotificationList) {
    return (
      <KolamListFrame variant="attentionList" style={styles.attentionList}>
        <View style={styles.attentionEmptyState}>
          <KolamNotificationBellIcon />
          <Text style={styles.attentionEmptyText}>No notifications</Text>
        </View>
      </KolamListFrame>
    );
  }

  return (
    <KolamListFrame variant="attentionList" style={styles.attentionList}>
      <ScrollView
        style={styles.attentionList}
        contentContainerStyle={styles.attentionScrollContent}>
        <KolamMappedList
          items={items}
          limit={10}
          getKey={item => item.id}
          renderItem={item => (
            <KolamAttentionPanelItem item={item} onItemPress={onItemPress} />
          )}
        />
      </ScrollView>
    </KolamListFrame>
  );
}
