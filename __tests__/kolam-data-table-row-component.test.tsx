import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamDataTablePrimaryCell} from '../src/components/kolam-data-table-primary-cell';
import {KolamDataTableRowFrame} from '../src/components/kolam-data-table-row-frame';
import {
  KolamDataTableAmountCell,
  KolamDataTableMetaCell,
} from '../src/components/kolam-data-table-text-cell';

describe('Kolam data table row primitives', () => {
  it('renders shared table row copy and value cells', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamDataTableRowFrame>
          <KolamDataTablePrimaryCell
            title="Air pump"
            subtitle="product - AP-1 - equipment"
          />
          <KolamDataTableMetaCell>12 stok</KolamDataTableMetaCell>
          <KolamDataTableAmountCell>Rp12.000</KolamDataTableAmountCell>
        </KolamDataTableRowFrame>,
      );
    });

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Air pump',
      'product - AP-1 - equipment',
      '12 stok',
      'Rp12.000',
    ]);
  });
});
