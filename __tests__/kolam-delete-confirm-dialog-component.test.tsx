import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { KolamDeleteConfirmDialog } from '../src/components/kolam-delete-confirm-dialog';
import { KolamConfirmDialog } from '../src/components/kolam-confirm-dialog';

describe('KolamDeleteConfirmDialog', () => {
  it('centralizes Indonesian destructive delete copy for all modules', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDeleteConfirmDialog
          itemLabel="Amidis"
          itemType="merek"
          visible
          onCancel={jest.fn()}
          onConfirm={jest.fn()}
        />,
      );
    });

    expect(renderer!.root.findByType(KolamConfirmDialog).props).toEqual(
      expect.objectContaining({
        destructive: true,
        confirmLabel: 'Hapus',
        message:
          'Apakah Anda yakin untuk menghapus merek Amidis? Yang sudah dihapus tidak bisa kembali lagi.',
        title: 'Hapus merek?',
      }),
    );
  });
});
