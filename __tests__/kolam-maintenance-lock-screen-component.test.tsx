import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamMaintenanceLockScreen} from '../src/components/kolam-maintenance-lock-screen';

function collectText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.findAllByType(Text).map(node => node.props.children);
}

test('renders native maintenance page with deploy copy', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<KolamMaintenanceLockScreen />);
  });

  expect(collectText(renderer!)).toEqual(
    expect.arrayContaining([
      'Maintenance sedang berlangsung',
      'Website sedang diperbarui',
      'Sistem Aman',
      'Data akun, pesanan, dan transaksi Anda tetap aman.',
      'Sedang Ditingkatkan',
      'Kami meningkatkan performa dan stabilitas website.',
      'Segera Kembali',
      'Terima kasih atas kesabaran dan kepercayaan Anda.',
      '© 2026 Dunia Anura. All rights reserved.',
    ]),
  );
});
