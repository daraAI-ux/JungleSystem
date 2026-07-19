import React from 'react';
import {Text, TextInput} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSearchField} from '../src/components/kolam-search-field';

describe('KolamSearchField', () => {
  it('renders the shared native search input with trailing hint support', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSearchField
          value="plugin"
          placeholder="cari plugin"
          trailingLabel="Esc"
        />,
      );
    });

    const input = renderer!.root.findByType(TextInput);

    expect(input.props.value).toBe('plugin');
    expect(input.props.placeholder).toBe('cari plugin');
    expect(input.props.autoCapitalize).toBe('none');
    expect(renderer!.root.findByType(Text).props.children).toBe('Esc');
  });

  it('keeps onChangeText behavior delegated to the caller', async () => {
    const onChangeText = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSearchField
          value=""
          onChangeText={onChangeText}
          placeholder="cari"
        />,
      );
    });

    renderer!.root.findByType(TextInput).props.onChangeText('kasir');

    expect(onChangeText).toHaveBeenCalledWith('kasir');
  });
});
