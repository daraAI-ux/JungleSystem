import React from 'react';
import { StyleSheet } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamMenuPressableFrame } from './kolam-menu-pressable-frame';

export interface KolamMenuItemProps {
  active?: boolean;
  grouped?: boolean;
  label: string;
  onPress: () => void;
}

export function KolamMenuItem({
  active = false,
  grouped = false,
  label,
  onPress,
}: KolamMenuItemProps) {
  return (
    <KolamMenuPressableFrame
      active={active}
      onPress={onPress}
      variant={grouped ? 'groupedItem' : 'item'}
    >
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            style: [styles.itemLabel, active && styles.itemLabelActive],
          },
        ]}
      />
    </KolamMenuPressableFrame>
  );
}

const styles = StyleSheet.create({
  itemLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  itemLabelActive: {
    color: V.colors.primary,
    fontWeight: '900',
  },
});
