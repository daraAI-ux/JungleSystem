import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { KolamHoverTooltip } from '../src/components/kolam-hover-tooltip';
import { KolamStockTransactionSourceIcon } from '../src/components/kolam-stock-transaction-source-icon';

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
});
