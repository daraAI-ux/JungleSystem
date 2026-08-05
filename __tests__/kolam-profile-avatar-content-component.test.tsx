import React from 'react';
import {Image} from 'react-native';
import {SvgXml} from 'react-native-svg';
import ReactTestRenderer from 'react-test-renderer';
import {KolamProfileAvatarContent} from '../src/components/kolam-profile-avatar-content';

describe('KolamProfileAvatarContent', () => {
  it('renders raster avatars with React Native Image', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamProfileAvatarContent
          imageUrl="https://cdn.example.com/staff.jpg"
          imageStyle={{height: 32, width: 32}}
          initials="DA"
          textStyle={{fontSize: 12}}
        />,
      );
    });

    expect(renderer!.root.findByType(Image).props.source).toEqual({
      uri: 'https://cdn.example.com/staff.jpg',
    });
  });

  it('renders SVG avatars as native vector XML', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<svg viewBox="0 0 24 24" />',
    }) as unknown as typeof fetch;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamProfileAvatarContent
          imageUrl="https://cdn.example.com/dara.svg"
          imageStyle={{height: 32, width: 32}}
          initials="DA"
          textStyle={{fontSize: 12}}
        />,
      );
    });

    expect(renderer!.root.findByType(SvgXml).props.xml).toBe(
      '<svg viewBox="0 0 24 24" />',
    );
    expect(renderer!.root.findAllByType(Image)).toHaveLength(0);

    globalThis.fetch = originalFetch;
  });
});
