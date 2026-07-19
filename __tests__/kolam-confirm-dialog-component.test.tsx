import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamButton } from '../src/components/kolam-button';
import { KolamConfirmDialog } from '../src/components/kolam-confirm-dialog';

describe('KolamConfirmDialog', () => {
  it('renders Indonesian destructive confirmation copy and forwards actions', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamConfirmDialog
          destructive
          confirmLabel="Hapus"
          message="Apakah Anda yakin untuk menghapus Merek A? Yang sudah dihapus tidak bisa kembali lagi."
          title="Hapus merek?"
          visible
          onCancel={onCancel}
          onConfirm={onConfirm}
        />,
      );
    });

    const text = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children)
      .join(' ');

    expect(text).toContain('Hapus merek?');
    expect(text).toContain('Yang sudah dihapus tidak bisa kembali lagi.');

    const buttons = renderer!.root.findAllByType(KolamButton);
    buttons.find(button => button.props.label === 'Batal')?.props.onPress();
    buttons.find(button => button.props.label === 'Hapus')?.props.onPress();

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
