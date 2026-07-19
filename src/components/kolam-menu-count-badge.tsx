import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamMenuCountBadge({label}: {label: string | number}) {
  return (
    <KolamCopyStack
      items={[{id: 'count', text: label, style: styles.countBadge}]}
    />
  );
}

const styles = StyleSheet.create({
  countBadge: {
    overflow: 'hidden',
    minWidth: 22,
    paddingHorizontal: V.control.badgePaddingX,
    paddingVertical: V.control.badgePaddingY,
    borderRadius: V.control.badgeRadius,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
