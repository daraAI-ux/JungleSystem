import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamWorkspaceTab} from '../domain/kolam-workspace-tabs';
import {KolamActionGlyph} from './kolam-action-glyph';
import {KolamIconButton} from './kolam-icon-button';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamXIcon} from './kolam-x-icon';

export interface KolamWorkspaceTabStripProps {
  activeTabId: string;
  onCreateTab: () => void;
  onTabClose: (tabId: string) => void;
  onTabSelect: (tabId: string) => void;
  tabs: KolamWorkspaceTab[];
}

export function KolamWorkspaceTabStrip({
  activeTabId,
  onCreateTab,
  onTabClose,
  onTabSelect,
  tabs,
}: KolamWorkspaceTabStripProps) {
  return (
    <View accessibilityRole="tablist" style={styles.shell}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {tabs.map(tab => (
          <WorkspaceTabButton
            key={tab.id}
            active={tab.id === activeTabId}
            closable={tabs.length > 1}
            label={tab.label}
            onClose={() => onTabClose(tab.id)}
            onPress={() => onTabSelect(tab.id)}
          />
        ))}
      </ScrollView>
      <KolamIconButton
        accessibilityLabel="Tab baru"
        onPress={onCreateTab}
        size={28}
        radius="md"
        variant="ghost"
        style={styles.addButton}>
        <KolamActionGlyph variant="plus" />
      </KolamIconButton>
    </View>
  );
}

function WorkspaceTabButton({
  active,
  closable,
  label,
  onClose,
  onPress,
}: {
  active: boolean;
  closable: boolean;
  label: string;
  onClose: () => void;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      accessibilityRole="tab"
      accessibilityState={{selected: active}}
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}>
      <Text
        numberOfLines={1}
        style={[styles.tabLabel, active && styles.activeTabLabel]}>
        {label}
      </Text>
      {closable ? (
        <KolamIconButton
          accessibilityLabel={`Tutup ${label}`}
          onPress={onClose}
          size={22}
          radius="full"
          variant="ghost"
          style={styles.closeButton}>
          <KolamXIcon color={V.colors.primaryFg} />
        </KolamIconButton>
      ) : null}
      {active ? <View style={styles.indicator} /> : null}
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: V.colors.border,
    backgroundColor: V.colors.navbar,
  },
  list: {
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  tab: {
    minHeight: 32,
    maxWidth: 190,
    minWidth: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderRadius: V.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  activeTab: {
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
  },
  tabLabel: {
    flexShrink: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: V.colors.fg,
  },
  closeButton: {
    backgroundColor: V.colors.danger,
    flexShrink: 0,
  },
  addButton: {
    flexShrink: 0,
  },
  indicator: {
    position: 'absolute',
    right: 8,
    bottom: -4,
    left: 8,
    height: 2,
    borderRadius: 999,
    backgroundColor: V.colors.primary,
  },
});
