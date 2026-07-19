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
  routeHint: string;
  sectionStart?: boolean;
  trailing?: ReactNode;
}

export function KolamUserMenuItem({
  danger = false,
  icon,
  label,
  onPress,
  routeHint,
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
          {id: 'route', text: routeHint, style: styles.route},
        ]}
      />
      {trailing}
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: V.layout.cardCompactSpacing,
    paddingVertical: 9,
  },
  itemSectionStart: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.muted,
  },
  iconDanger: {
    backgroundColor: V.colors.warningSoft,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  labelDanger: {
    color: V.colors.danger,
  },
  route: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
});
