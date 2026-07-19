import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {getKolamControlTabsVisualContract} from '../domain/kolam-control-tabs';
import {KolamControlTabItem} from './kolam-control-tab-item';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

const KOLAM_CONTROL_TABS_VISUAL = getKolamControlTabsVisualContract();

export interface KolamControlTabListItem {
  count?: number;
  flag?: string;
  id: string;
  label: string;
}

export interface KolamControlTabListProps {
  accessibilityLabel?: string;
  items: KolamControlTabListItem[];
  onSelect: (itemId: string) => void;
  selectedId: string;
}

export function KolamControlTabList({
  accessibilityLabel,
  items,
  onSelect,
  selectedId,
}: KolamControlTabListProps) {
  return (
    <KolamListFrame
      accessibilityLabel={accessibilityLabel}
      variant="controlTabShell">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        <KolamMappedList
          items={items}
          getKey={item => item.id}
          renderItem={item => (
            <KolamControlTabItem
              count={item.count}
              flag={item.flag}
              label={item.label}
              onPress={() => onSelect(item.id)}
              selected={item.id === selectedId}
            />
          )}
        />
      </ScrollView>
    </KolamListFrame>
  );
}

const styles = StyleSheet.create({
  list: {
    alignItems: 'center',
    gap: KOLAM_CONTROL_TABS_VISUAL.tabListGap,
  },
});