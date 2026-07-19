import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export function KolamMenuItemGroupLabel({label}: {label: string}) {
  return (
    <KolamCopyStack
      items={[{id: 'group', text: label, style: styles.groupLabel}]}
    />
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    marginTop: 6,
    marginLeft: 14,
    paddingLeft: 16,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
