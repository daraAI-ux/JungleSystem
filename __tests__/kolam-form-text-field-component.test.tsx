import React from 'react';
import {TextInput} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamFormTextField} from '../src/components/kolam-form-text-field';
import {KolamTextField} from '../src/components/kolam-text-field';

describe('KolamFormTextField', () => {
  it('applies stable mode defaults through KolamTextField', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamFormTextField mode="email" value="" onChangeText={jest.fn()} />,
      );
    });

    const field = renderer!.root.findByType(KolamTextField);

    expect(field.props.autoCapitalize).toBe('none');
    expect(field.props.keyboardType).toBe('email-address');
  });

  it('keeps caller overrides and delegates native text input behavior', async () => {
    const onChangeText = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamFormTextField
          mode="numeric"
          keyboardType="decimal-pad"
          value="1"
          onChangeText={onChangeText}
        />,
      );
    });

    const input = renderer!.root.findByType(TextInput);

    expect(input.props.keyboardType).toBe('decimal-pad');
    input.props.onChangeText('2');
    expect(onChangeText).toHaveBeenCalledWith('2');
  });

  it('centralizes secure password fields', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamFormTextField mode="password" value="" />,
      );
    });

    expect(renderer!.root.findByType(KolamTextField).props.secureTextEntry).toBe(
      true,
    );
  });
});
