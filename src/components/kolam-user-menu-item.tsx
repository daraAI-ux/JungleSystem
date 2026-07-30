import React, {type ReactNode} from 'react';
import {StyleSheet, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';

export interface KolamUserMenuItemProps {
  danger?: boolean;
  icon: ReactNode;
  label: string;
  onPress: () => void;
  routeHint?: string;
  sectionStart?: boolean;
  trailing?: ReactNode;
}

export function KolamUserMenuItem({
  danger = false,
  icon,
  label,
  onPress,
  routeHint: _routeHint,
  sectionStart = false,
  trailing,
}: KolamUserMenuItemProps) {
  return (
    <KolamInteractionFrame
      onPress={onPress}
      style={[styles.item, sectionStart && styles.itemSectionStart]}>
      <View style={[styles.icon, danger && styles.iconDanger]}>{icon}</View>
      <KolamCopyStack
        containerStyle={styles.copy}
        items={[
          {
            id: 'label',
            text: label,
            style: [styles.label, danger && styles.labelDanger],
          },
        ]}
      />
      {trailing}
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  itemSectionStart: {
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 8,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconDanger: {
    backgroundColor: 'transparent',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: '#d6d6d6',
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  labelDanger: {
    color: '#f87171',
  },
});
