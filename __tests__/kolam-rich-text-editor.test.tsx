import React from 'react';
import {TextInput, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamRichTextEditor} from '../src/components/kolam-rich-text-editor';

function renderEditor(value: string, onChangeText = jest.fn()) {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <View>
        <KolamRichTextEditor
          onChangeText={onChangeText}
          placeholder="Deskripsi"
          value={value}
        />
      </View>,
    );
  });

  return {onChangeText, renderer: renderer!};
}

function selectText(
  renderer: ReactTestRenderer.ReactTestRenderer,
  start: number,
  end: number,
) {
  const input = renderer.root.findAllByType(TextInput).at(-1);
  ReactTestRenderer.act(() => {
    input?.props.onSelectionChange({
      nativeEvent: {selection: {end, start}},
    });
  });
}

describe('KolamRichTextEditor', () => {
  it('applies toolbar formatting to the current selection', () => {
    const {onChangeText, renderer} = renderEditor('Air distilasi');
    selectText(renderer, 0, 3);

    ReactTestRenderer.act(() => {
      renderer.root.findByProps({accessibilityLabel: 'Bold'}).props.onPress();
    });

    expect(onChangeText).toHaveBeenCalledWith(
      '<strong>Air</strong> distilasi',
    );
  });

  it('inserts heading and link HTML through reusable toolbar commands', () => {
    const first = renderEditor('Judul');
    selectText(first.renderer, 0, 5);

    ReactTestRenderer.act(() => {
      first.renderer.root
        .findByProps({accessibilityLabel: 'Heading 2'})
        .props.onPress();
    });

    expect(first.onChangeText).toHaveBeenCalledWith('<h2>Judul</h2>');

    const second = renderEditor('Website');
    selectText(second.renderer, 0, 7);

    ReactTestRenderer.act(() => {
      second.renderer.root
        .findByProps({accessibilityLabel: 'Tambah link'})
        .props.onPress();
    });

    const linkInput = second.renderer.root.findAllByType(TextInput)[0];
    ReactTestRenderer.act(() => {
      linkInput.props.onChangeText('example.com');
    });
    ReactTestRenderer.act(() => {
      second.renderer.root.findByProps({accessibilityLabel: 'Simpan'}).props.onPress();
    });

    expect(second.onChangeText).toHaveBeenCalledWith(
      '<a href="https://example.com">Website</a>',
    );
  });

  it('clears basic HTML formatting from selected content', () => {
    const {onChangeText, renderer} = renderEditor('<strong>Air</strong>');
    selectText(renderer, 0, '<strong>Air</strong>'.length);

    ReactTestRenderer.act(() => {
      renderer.root
        .findByProps({accessibilityLabel: 'Hapus format dasar'})
        .props.onPress();
    });

    expect(onChangeText).toHaveBeenCalledWith('Air');
  });
});
