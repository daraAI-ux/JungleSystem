import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamTextField} from '../src/components/kolam-text-field';
import {KolamTextFieldRow} from '../src/components/kolam-text-field-row';

describe('KolamTextFieldRow', () => {
  it('renders a shared label/description row with a KolamTextField', async () => {
    const onChangeText = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTextFieldRow
          label="Storefront title"
          description="Judul toko web"
          value="Kolam Store"
          onChangeText={onChangeText}
          placeholder="Storefront title"
        />,
      );
    });

    const input = renderer!.root.findByType(KolamTextField);

    expect(input.props.value).toBe('Kolam Store');
    expect(input.props.placeholder).toBe('Storefront title');
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Storefront title',
      'Judul toko web',
    ]);

    input.props.onChangeText('Kolam Live');
    expect(onChangeText).toHaveBeenCalledWith('Kolam Live');
  });
});
