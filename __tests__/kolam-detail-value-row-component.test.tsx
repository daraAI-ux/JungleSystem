import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamBadge} from '../src/components/kolam-badge';
import {KolamDetailValueRow} from '../src/components/kolam-detail-value-row';

describe('KolamDetailValueRow', () => {
  it('renders copy text and a tone-aware trailing value badge', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDetailValueRow
          label="Runtime"
          meta="Server aktif"
          tone="warning"
          value="limited"
        />,
      );
    });

    expect(renderer!.root.findByType(KolamBadge).props).toEqual(
      expect.objectContaining({
        align: 'right',
        intent: 'warning',
        label: 'limited',
        weight: '800',
      }),
    );
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Runtime',
      'Server aktif',
      'limited',
    ]);
  });

  it('keeps default detail values in the info badge tone', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDetailValueRow label="Client" meta="Desktop" value="native" />,
      );
    });

    expect(renderer!.root.findByType(KolamBadge).props.intent).toBe('info');
  });
});
