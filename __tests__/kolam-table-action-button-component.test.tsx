import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamTableActionButton,
  KolamTableEyeIcon,
} from '../src/components/kolam-table-action-button';

describe('KolamTableActionButton', () => {
  it('renders a shared compact table action button and delegates press behavior', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTableActionButton
          accessibilityLabel="Detail log /api/products"
          onPress={onPress}
        />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(button.props.accessibilityLabel).toBe('Detail log /api/products');

    button.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps the eye glyph reusable for table action cells', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamTableEyeIcon color="#123456" />);
    });

    expect(renderer!.root.findAllByType(View)).toHaveLength(3);
  });
});
