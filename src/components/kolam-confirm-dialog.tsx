import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamButton } from './kolam-button';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamModalBackdrop } from './kolam-modal-backdrop';

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
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <KolamModalBackdrop onPress={onCancel} />
        <View accessibilityLabel={title} style={styles.dialog}>
          <KolamCopyStack
            items={[
              { id: 'title', text: title, style: styles.title },
              { id: 'message', text: message, style: styles.message },
            ]}
          />
          <View style={styles.actions}>
            <KolamButton label={cancelLabel} onPress={onCancel} />
            <KolamButton
              intent={destructive ? 'danger' : 'primary'}
              label={confirmLabel}
              onPress={onConfirm}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: 420,
    maxWidth: '86%',
    gap: 18,
    padding: 18,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 17,
    fontWeight: '900',
  },
  message: {
    marginTop: 8,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
