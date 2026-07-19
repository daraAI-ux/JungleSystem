import React from 'react';
import { StyleSheet } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamBrandLogo } from '../src/components/kolam-brand-logo';
import { KolamLocalAssetImage } from '../src/components/kolam-local-asset-image';
import type { KolamBrand } from '../src/domain/kolam-brand';

const brand: KolamBrand = {
  id: 'brand-1',
  name: 'Dunia Anura',
  slug: 'dunia-anura',
  description: '',
  originCountry: 'Japan',
  status: 'active',
  notes: '',
  links: [],
  photos: [],
  logoUrl: 'https://cdn/logo.png',
  productCount: 1,
  rawMaterialCount: 2,
  serviceCount: 0,
  speciesCount: 0,
  raw: {},
};

describe('KolamBrandLogo', () => {
  it('renders brand logos as reusable borderless rectangles', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamBrandLogo brand={brand} variant="detail" />,
      );
    });

    const wrapperStyle = StyleSheet.flatten(
      renderer!.root.findByType(KolamLocalAssetImage).parent?.props.style,
    );

    expect(wrapperStyle).toEqual(
      expect.objectContaining({
        width: 260,
        height: 86,
        overflow: 'hidden',
      }),
    );
    expect(wrapperStyle).toEqual(
      expect.not.objectContaining({
        borderWidth: 1,
      }),
    );
  });
});
