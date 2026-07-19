import React from 'react';
import {StyleSheet, Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamTextAction} from '../src/components/kolam-text-action';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamTextAction', () => {
  it('renders compact text action semantics and calls onPress', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTextAction label="See all" onPress={onPress} />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    button.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.props.accessibilityLabel).toBe('See all');
    expect(renderer!.root.findByType(Text).props.children).toBe('See all');
  });

  it('keeps visible text stable while exposing a route-aware action label', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTextAction
          accessibilityLabel="Konfirmasi - /layanan/voucher/visit"
          label="Konfirmasi"
          onPress={() => undefined}
        />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(button.props.accessibilityLabel).toBe(
      'Konfirmasi - /layanan/voucher/visit',
    );
    expect(renderer!.root.findByType(Text).props.children).toBe('Konfirmasi');
  });

  it('supports the live dashboard primary underline variant', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTextAction
          label="Konfirmasi"
          onPress={() => undefined}
          variant="primaryUnderline"
        />,
      );
    });

    const style = StyleSheet.flatten(renderer!.root.findByType(Text).props.style);

    expect(style).toEqual(
      expect.objectContaining({
        color: V.colors.primary,
        textDecorationLine: 'underline',
      }),
    );
  });
});
