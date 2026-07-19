import React from 'react';
import { StyleSheet, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamFlagIcon } from '../src/components/kolam-flag-icon';
import { getKolamCountryFlagByCountry } from '../src/domain/kolam-country-flags';

describe('KolamFlagIcon', () => {
  it('renders a native colored flag without country code text', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamFlagIcon option={getKolamCountryFlagByCountry('Indonesia')} />,
      );
    });

    const coloredStripe = renderer!.root
      .findAllByType(View)
      .find(node =>
        JSON.stringify(StyleSheet.flatten(node.props.style)).includes(
          '#ef4444',
        ),
      );

    expect(coloredStripe).toBeTruthy();
    expect(renderer!.root.findAllByProps({ children: 'ID' })).toEqual([]);
  });
});
