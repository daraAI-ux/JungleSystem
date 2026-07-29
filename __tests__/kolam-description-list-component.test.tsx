import React from 'react';
import {Pressable, Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamBadge} from '../src/components/kolam-badge';
import {KolamDescriptionList} from '../src/components/kolam-description-list';

describe('KolamDescriptionList', () => {
  it('renders term, badge value, and meta rows with source accessibility context', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDescriptionList
          accessibilityLabel="live description list mapped to native Settings"
          rows={[
            {
              id: 'runtime',
              label: 'Runtime',
              value: 'ready',
              tone: 'success',
              meta: 'Server runtime aktif',
            },
            {
              id: 'client',
              label: 'Client',
              value: 'native',
              tone: 'default',
              meta: 'Windows desktop',
            },
          ]}
        />,
      );
    });

    expect(
      renderer!.root.findByProps({
        accessibilityLabel: 'live description list mapped to native Settings',
      }),
    ).toBeTruthy();
    expect(renderer!.root.findAllByType(KolamBadge).map(node => node.props.intent)).toEqual([
      'success',
      'muted',
    ]);
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Runtime',
      'ready',
      'Server runtime aktif',
      'Client',
      'native',
      'Windows desktop',
    ]);
  });

  it('wraps value in a pressable link when row onPress is set', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDescriptionList
          accessibilityLabel="po vendor link"
          rows={[
            {
              id: 'vendor',
              label: 'Pemasok',
              value: 'Java petco',
              meta: '',
              tone: 'default',
              onPress,
            },
          ]}
        />,
      );
    });

    const link = renderer!.root.findByProps({accessibilityRole: 'link'});
    expect(link.type).toBe(Pressable);
    await ReactTestRenderer.act(async () => {
      link.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
