import React from 'react';
import { StyleSheet } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamCopyStack } from './kolam-copy-stack';
import {KolamModalDialog} from './kolam-modal-dialog';

export function KolamConfirmDialog({
  cancelLabel = 'Batal',
  confirmLabel = 'Hapus',
  destructive = false,
  message,
  onCancel,
  onConfirm,
  title,
  visible,
}: {
  cancelLabel?: string;
  confirmLabel?: string;
  destructive?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  visible: boolean;
}) {
  return (
    <KolamModalDialog
      maxWidth="86%"
      onClose={onCancel}
      title={title}
      visible={visible}
      width={420}
      footer={
        <>
          <KolamButton label={cancelLabel} onPress={onCancel} />
          <KolamButton
            intent={destructive ? 'danger' : 'primary'}
            label={confirmLabel}
            onPress={onConfirm}
          />
        </>
      }>
      <KolamCopyStack
        items={[{id: 'message', text: message, style: styles.message}]}
      />
    </KolamModalDialog>
  );
}

const styles = StyleSheet.create({
  message: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 20,
  },
});
