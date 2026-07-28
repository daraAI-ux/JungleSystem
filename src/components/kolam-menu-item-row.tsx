import React from 'react';
import { StyleSheet, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamMenuItemIcon } from './kolam-menu-item-icon';
import { KolamMenuPressableFrame } from './kolam-menu-pressable-frame';

export interface KolamMenuItemProps {
  active?: boolean;
  grouped?: boolean;
  label: string;
  onPress: () => void;
  route: string;
}

export function KolamMenuItem({
  active = false,
  grouped = false,
  label,
  onPress,
  route,
}: KolamMenuItemProps) {
  return (
    <KolamMenuPressableFrame
      active={active}
      onPress={onPress}
      variant={grouped ? 'groupedItem' : 'item'}
    >
      <View style={styles.itemBody}>
        <KolamMenuItemIcon active={active} route={route} />
        <KolamCopyStack
          containerStyle={styles.itemCopy}
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
  itemBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCopy: {
    flex: 1,
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
