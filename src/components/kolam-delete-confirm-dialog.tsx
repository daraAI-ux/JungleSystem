import React from 'react';
import { KolamConfirmDialog } from './kolam-confirm-dialog';

export function KolamDeleteConfirmDialog({
  itemLabel,
  itemType = 'data ini',
  onCancel,
  onConfirm,
  visible,
}: {
  itemLabel?: string | null;
  itemType?: string;
  onCancel: () => void;
  onConfirm: () => void;
  visible: boolean;
}) {
  const subject = itemLabel ? `${itemType} ${itemLabel}` : itemType;

  return (
    <KolamConfirmDialog
      destructive
      confirmLabel="Hapus"
      message={`Apakah Anda yakin untuk menghapus ${subject}? Yang sudah dihapus tidak bisa kembali lagi.`}
      title={`Hapus ${itemType}?`}
      visible={visible}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
