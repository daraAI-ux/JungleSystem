import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSelectableCard} from '../src/components/kolam-selectable-card';

describe('KolamSelectableCard', () => {
  it('renders a reusable half-width interactive card and delegates press behavior', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSelectableCard
          accessibilityLabel="Pilih produk"
          minHeight={168}
          onPress={onPress}>
          <Text>Produk</Text>
        </KolamSelectableCard>,
      );
    });

    const card = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(card.props.accessibilityLabel).toBe('Pilih produk');
    expect(renderer!.root.findByType(Text).props.children).toBe('Produk');

    card.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports third-width blocked cards for runtime actions', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSelectableCard layout="third" blocked>
          <Text>Runtime</Text>
        </KolamSelectableCard>,
      );
    });

    const card = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(card.props.accessibilityState).toEqual({disabled: true});
  });
});
