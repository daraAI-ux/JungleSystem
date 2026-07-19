import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamEndpointList} from '../src/components/kolam-endpoint-list';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamEndpointList', () => {
  it('renders endpoint copy and contract details', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEndpointList
          accessibilityLabel="settings endpoints"
          endpoints={[
            {
              id: 'roles',
              label: 'Roles',
              method: 'GET',
              path: '/roles',
              permission: 'roles:view',
            },
          ]}
        />,
      );
    });

    expect(renderer!.root.findByProps({accessibilityLabel: 'settings endpoints'})).toBeTruthy();
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Roles',
      'roles:view',
      'GET',
      '/roles',
    ]);
    expect(renderer!.root.findAllByType(View)[0].props.style).toEqual(
      expect.objectContaining({backgroundColor: V.colors.bg}),
    );
  });
});
