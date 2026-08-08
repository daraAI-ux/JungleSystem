import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamWorkspaceTab} from '../domain/kolam-workspace-tabs';
import {KolamActionGlyph} from './kolam-action-glyph';
import {KolamIconButton} from './kolam-icon-button';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamModuleIcon} from './kolam-module-icon';
import {KolamPressable} from './kolam-pressable';
import {KolamXIcon} from './kolam-x-icon';

const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();
const KOLAM_WORKSPACE_TAB_STRIP_BG = '#F3F4F6';

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
      <View style={styles.inner}>
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
              moduleIcon={tab.snapshot.activeNavigationItem?.moduleIcon}
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
    </View>
  );
}

function WorkspaceTabButton({
  active,
  closable,
  label,
  moduleIcon,
  onClose,
  onPress,
}: {
  active: boolean;
  closable: boolean;
  label: string;
  moduleIcon?: KolamNavigationModuleIcon;
  onClose: () => void;
  onPress: () => void;
}) {
  const [isCloseHovered, setIsCloseHovered] = React.useState(false);

  return (
    <KolamInteractionFrame
      accessibilityRole="tab"
      accessibilityState={{selected: active}}
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}>
      {moduleIcon ? (
        <View style={styles.moduleIconSurface}>
          <KolamModuleIcon kind={moduleIcon} />
        </View>
      ) : null}
      <Text
        numberOfLines={1}
        style={[styles.tabLabel, active && styles.activeTabLabel]}>
        {label}
      </Text>
      {closable ? (
        <KolamPressable
          accessibilityLabel={`Tutup ${label}`}
          accessibilityRole="button"
          onHoverIn={() => setIsCloseHovered(true)}
          onHoverOut={() => setIsCloseHovered(false)}
          onPress={onClose}
          style={({pressed}: {pressed?: boolean}) => [
            styles.closeButton,
            (isCloseHovered || pressed) && styles.closeButtonHovered,
          ]}>
          <KolamXIcon color={V.colors.primaryFg} size="sm" />
        </KolamPressable>
      ) : null}
      {active ? <View style={styles.indicator} /> : null}
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 38,
    justifyContent: 'center',
    backgroundColor: KOLAM_WORKSPACE_TAB_STRIP_BG,
  },
  inner: {
    width: '100%',
    maxWidth: DASHBOARD_LAYOUT_VISUAL.page.maxWidthPx,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: DASHBOARD_LAYOUT_VISUAL.page.paddingX,
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
  moduleIconSurface: {
    alignItems: 'center',
    backgroundColor: V.colors.primaryFg,
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    width: 18,
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
    alignItems: 'center',
    backgroundColor: V.colors.mutedFg,
    borderRadius: 7.5,
    flexShrink: 0,
    height: 15,
    justifyContent: 'center',
    width: 15,
  },
  closeButtonHovered: {
    backgroundColor: V.colors.danger,
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
