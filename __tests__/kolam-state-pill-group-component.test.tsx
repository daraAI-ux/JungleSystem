import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamStatePillGroup} from '../src/components/kolam-state-pill-group';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamStatePillGroup', () => {
  it('renders selected and disabled pill state styles', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatePillGroup
          accessibilityLabel="permission actions"
          items={[
            {id: 'view', label: 'View', selected: true},
            {id: 'delete', label: 'Delete', disabled: true},
          ]}
        />,
      );
    });

    expect(
      renderer!.root.findByProps({accessibilityLabel: 'permission actions'}),
    ).toBeTruthy();
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'View',
      'Delete',
    ]);

    const pills = renderer!.root
      .findAllByType(View)
      .filter(node => Array.isArray(node.props.style));

    expect(pills[0].props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({borderColor: V.colors.primary}),
      ]),
    );
    expect(pills[1].props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({opacity: 0.78})]),
    );
  });
});
