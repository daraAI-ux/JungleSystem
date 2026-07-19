import React from 'react';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';

export function KolamSyncStatusBar({
  errorMessage,
  loading,
  message,
}: {
  errorMessage?: string;
  loading: boolean;
  message: string;
}) {
  return (
    <KolamCardFrame variant="syncStatusBar">
      <KolamCopyStack
        items={[
          {
            id: 'message',
            text: [message, loading ? ' - loading' : ''],
            style: styles.syncText,
          },
          ...(errorMessage
            ? [{id: 'error', text: errorMessage, style: styles.syncError}]
            : []),
        ]}
      />
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  syncText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  syncError: {
    marginTop: 2,
    color: V.colors.warning,
    fontSize: 12,
  },
});