import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';

export interface KolamOperationalEmptyProps {
  message: string;
  title: string;
}

export function KolamOperationalEmpty({
  message,
  title,
}: KolamOperationalEmptyProps) {
  return (
    <KolamCopyStack
      containerStyle={styles.operationalEmpty}
      items={[
        {id: 'title', text: title, style: styles.operationalEmptyTitle},
        {id: 'message', text: message, style: styles.operationalEmptyText},
      ]}
    />
  );
}

const styles = StyleSheet.create({
  operationalEmpty: {
    marginBottom: 16,
    paddingVertical: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  operationalEmptyTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  operationalEmptyText: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 12,
  },
});
