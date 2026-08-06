import React from 'react';
import { StyleSheet } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamChevronIcon } from './kolam-chevron-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamMenuPressableFrame } from './kolam-menu-pressable-frame';

export function KolamMenuItemGroupLabel({
  expanded,
  label,
  onPress,
}: {
  expanded: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <KolamMenuPressableFrame onPress={onPress} variant="groupToggle">
      <KolamChevronIcon
        direction={expanded ? 'down' : 'right'}
        size="menu-sm"
      />
      <KolamCopyStack
        items={[{ id: 'group', text: label, style: styles.groupLabel }]}
      />
    </KolamMenuPressableFrame>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    flex: 1,
    color: V.colors.sidebarFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
});
