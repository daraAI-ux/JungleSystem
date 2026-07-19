import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamButton} from '../src/components/kolam-button';
import {KolamDetailPanel} from '../src/components/kolam-detail-panel';

describe('KolamDetailPanel', () => {
  it('renders title, warning flags, fields, and close behavior', async () => {
    const onClose = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDetailPanel
          title="Detail Log"
          subtitle="/api/orders"
          onClose={onClose}
          warningFlags={['status:failed']}
          fields={[
            {id: 'user', label: 'User', value: 'Admin'},
            {id: 'ip', label: 'IP', value: '127.0.0.1', mono: true},
          ]}
        />,
      );
    });

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Detail Log',
      '/api/orders',
      'Tutup',
      'Suspicious flags',
      'status:failed',
      'User',
      'Admin',
      'IP',
      '127.0.0.1',
    ]);

    renderer!.root.findByType(KolamButton).props.onPress();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
