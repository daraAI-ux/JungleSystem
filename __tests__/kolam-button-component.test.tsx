import React from 'react';
import {StyleSheet, Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamButton} from '../src/components/kolam-button';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamButton', () => {
  it('renders a shared native button label', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamButton label="Sync" intent="outline" size="md" />,
      );
    });

    expect(renderer!.root.findByType(Text).props.children).toBe('Sync');
    expect(renderer!.root.findByProps({accessibilityRole: 'button'}).props.accessibilityRole).toBe(
      'button',
    );
  });

  it('blocks press only when disabled, while muted remains visual-only', async () => {
    const disabledPress = jest.fn();
    const mutedPress = jest.fn();
    let disabledRenderer: ReactTestRenderer.ReactTestRenderer;
    let mutedRenderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      disabledRenderer = ReactTestRenderer.create(
        <KolamButton label="Blocked" disabled onPress={disabledPress} />,
      );
      mutedRenderer = ReactTestRenderer.create(
        <KolamButton label="Muted" muted onPress={mutedPress} />,
      );
    });

    const disabledButton = disabledRenderer!.root.findByProps({
      accessibilityRole: 'button',
    });
    const mutedButton = mutedRenderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    expect(disabledButton.props.onPress).toBe(undefined);
    expect(disabledButton.props.disabled).toBe(true);
    expect(mutedButton.props.disabled).toBe(false);

    mutedButton.props.onPress();
    expect(disabledPress).not.toHaveBeenCalled();
    expect(mutedPress).toHaveBeenCalledTimes(1);
  });

  it('applies the reusable positive tone without changing intent semantics', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamButton label="Produk Baru" intent="outline" tone="positive" />,
      );
    });

    const buttonStyle = StyleSheet.flatten(
      renderer!.root.findByProps({accessibilityRole: 'button'}).props.style,
    );
    const textStyle = StyleSheet.flatten(renderer!.root.findByType(Text).props.style);

    expect(buttonStyle).toEqual(
      expect.objectContaining({
        backgroundColor: V.colors.successSoft,
        borderColor: V.colors.success,
      }),
    );
    expect(textStyle).toEqual(
      expect.objectContaining({
        color: V.colors.success,
      }),
    );
  });
});
