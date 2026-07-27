import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamHoverTooltip } from '../src/components/kolam-hover-tooltip';
import { KolamStockTransactionSourceIcon } from '../src/components/kolam-stock-transaction-source-icon';

jest.mock('../src/components/kolam-remote-image', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    KolamRemoteImage: ({
      accessibilityLabel,
    }: {
      accessibilityLabel: string;
    }) => ReactLib.createElement(View, { accessibilityLabel }),
  };
});

describe('KolamStockTransactionSourceIcon', () => {
  it('renders short colored badge with full tooltip label', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStockTransactionSourceIcon
          label="Stok opname"
          source="stock-opname"
        />,
      );
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['Opname']);
    expect(renderer!.root.findByType(KolamHoverTooltip).props.label).toBe(
      'Stok opname',
    );
  });

  it('falls back to short title for unknown source', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStockTransactionSourceIcon source="warehouse-transfer" />,
      );
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['Warehouse…']);
  });

  it('renders dash when source empty', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStockTransactionSourceIcon source="" />,
      );
    });

    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['—']);
  });

  it('renders sales source logo tooltip when logoUri provided', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStockTransactionSourceIcon
          label="Penjualan"
          logoUri="https://example.test/media/sources/shopee.png"
          salesSourceName="Shopee"
          source="sale"
        />,
      );
    });

    expect(renderer!.root.findByType(KolamHoverTooltip).props.label).toBe(
      'Shopee · Penjualan',
    );
    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual([]);
  });
});
