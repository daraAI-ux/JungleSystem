import React from 'react';
import { StyleSheet, View } from 'react-native';
import type {KolamNavigationModuleIcon} from '../domain/kolam-navigation';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamMenuPressableFrame } from './kolam-menu-pressable-frame';
import {KolamModuleIcon} from './kolam-module-icon';

export interface KolamMenuItemProps {
  active?: boolean;
  grouped?: boolean;
  label: string;
  moduleIcon?: KolamNavigationModuleIcon;
  onPress: () => void;
}

export function KolamMenuItem({
  active = false,
  grouped = false,
  label,
  moduleIcon,
  onPress,
}: KolamMenuItemProps) {
  return (
    <KolamMenuPressableFrame
      active={active}
      onPress={onPress}
      variant={grouped ? 'groupedItem' : 'item'}
    >
      <View style={styles.itemContent}>
        {moduleIcon ? <KolamModuleIcon kind={moduleIcon} /> : null}
        <KolamCopyStack
          items={[
            {
              id: 'label',
              text: label,
              style: [styles.itemLabel, active && styles.itemLabelActive],
            },
          ]}
        />
      </View>
    </KolamMenuPressableFrame>
  );
}

const styles = StyleSheet.create({
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
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
