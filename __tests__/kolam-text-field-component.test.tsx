import React from 'react';
import {TextInput} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamTextField} from '../src/components/kolam-text-field';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamTextField', () => {
  it('keeps native TextInput props delegated to the caller', async () => {
    const onChangeText = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTextField
          value="kasir"
          onChangeText={onChangeText}
          autoCapitalize="none"
          keyboardType="email-address"
          secureTextEntry
          placeholder="email kasir"
          style={{minHeight: 36}}
        />,
      );
    });

    const input = renderer!.root.findByType(TextInput);

    expect(input.props.value).toBe('kasir');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.keyboardType).toBe('email-address');
    expect(input.props.secureTextEntry).toBe(true);
    expect(input.props.placeholder).toBe('email kasir');
    expect(input.props.placeholderTextColor).toBe(V.colors.mutedFg);
    expect(input.props.style).toEqual({minHeight: 36});

    input.props.onChangeText('owner@kolam.test');

    expect(onChangeText).toHaveBeenCalledWith('owner@kolam.test');
  });

  it('allows a caller to override placeholder color', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTextField value="" placeholderTextColor="#111111" />,
      );
    });

    expect(renderer!.root.findByType(TextInput).props.placeholderTextColor).toBe(
      '#111111',
    );
  });
});
