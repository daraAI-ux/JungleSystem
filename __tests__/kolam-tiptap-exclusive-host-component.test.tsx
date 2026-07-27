import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamTipTapExclusiveField,
  KolamTipTapExclusiveGroup,
} from '../src/components/kolam-tiptap-exclusive-host';

jest.mock('../src/components/kolam-tiptap-rich-text-editor', () => {
  const ReactNative = require('react-native');
  return {
    KolamTipTapRichTextEditor: ({
      placeholder,
      value,
    }: {
      placeholder?: string;
      value: string;
    }) => (
      <ReactNative.Text>{`editor:${placeholder ?? ''}:${value}`}</ReactNative.Text>
    ),
  };
});

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }
  return [];
}

describe('KolamTipTapExclusiveGroup', () => {
  it('mounts only one TipTap editor at a time inside the group', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTipTapExclusiveGroup initialFieldId="description">
          <KolamTipTapExclusiveField
            fieldId="description"
            onChangeText={() => undefined}
            placeholder="Deskripsi spesies"
            value="<p>Desc</p>"
          />
          <KolamTipTapExclusiveField
            fieldId="morfologis"
            onChangeText={() => undefined}
            placeholder="Morfologis"
            value="<p>Morph</p>"
          />
          <KolamTipTapExclusiveField
            fieldId="habitat"
            onChangeText={() => undefined}
            placeholder="Habitat"
            value="<p>Hab</p>"
          />
        </KolamTipTapExclusiveGroup>,
      );
    });

    const texts = renderText(renderer!);
    expect(texts.filter(text => text.startsWith('editor:'))).toEqual([
      'editor:Deskripsi spesies:<p>Desc</p>',
    ]);
    expect(texts).toEqual(
      expect.arrayContaining(['Morph', 'Hab', 'Ketuk untuk mengedit di editor']),
    );
  });

  it('activates another field and demounts the previous editor', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTipTapExclusiveGroup initialFieldId="description">
          <KolamTipTapExclusiveField
            fieldId="description"
            onChangeText={() => undefined}
            placeholder="Deskripsi spesies"
            value="<p>Desc</p>"
          />
          <KolamTipTapExclusiveField
            fieldId="morfologis"
            onChangeText={() => undefined}
            placeholder="Morfologis"
            value="<p>Morph</p>"
          />
        </KolamTipTapExclusiveGroup>,
      );
    });

    const morfologisPreview = renderer!.root.find(
      node =>
        node.props?.accessibilityLabel === 'Morfologis' &&
        typeof node.props?.onPress === 'function',
    );

    await ReactTestRenderer.act(async () => {
      morfologisPreview.props.onPress();
    });

    const texts = renderText(renderer!);
    expect(texts.filter(text => text.startsWith('editor:'))).toEqual([
      'editor:Morfologis:<p>Morph</p>',
    ]);
    expect(texts).toEqual(expect.arrayContaining(['Desc']));
  });
});
