import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {Path} from 'react-native-svg';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamListTableComposition,
  KolamListTablePaginationFooter,
  kolamListTableCompositionStyles,
  type KolamListTableColumn,
} from '../src/components/kolam-list-table-composition';
import {KolamCatalogListTableShell} from '../src/components/kolam-catalog-list-table-shell';
import {KolamEmptyState} from '../src/components/kolam-empty-state';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

type TestRow = {
  amount: string;
  id: string;
  name: string;
};

const columns: Array<KolamListTableColumn<TestRow>> = [
  {
    flex: 1.2,
    id: 'name',
    label: 'Nama aset',
    render: row => (
      <Text style={kolamListTableCompositionStyles.primaryText}>{row.name}</Text>
    ),
  },
  {
    align: 'right',
    flex: 0.8,
    id: 'amount',
    label: 'Total',
    render: row => (
      <Text style={kolamListTableCompositionStyles.metaText}>{row.amount}</Text>
    ),
  },
];

describe('KolamListTableComposition', () => {
  it('renders the asset-purchase style table shell with header and rows', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListTableComposition
          columns={columns}
          footer={<Text>1-1 dari 1</Text>}
          getRowKey={row => row.id}
          rows={[{amount: 'Rp1.000', id: 'row-1', name: 'Laptop'}]}
        />,
      );
    });

    expect(renderer!.root.findByType(KolamCatalogListTableShell)).toBeTruthy();

    const textValues = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);

    expect(textValues).toEqual(
      expect.arrayContaining(['Nama aset', 'Total', 'Laptop', 'Rp1.000']),
    );

    const headerText = renderer!.root
      .findAllByType(Text)
      .find(node => node.props.children === 'Nama aset');

    expect(StyleSheet.flatten(headerText?.props.style)).toEqual(
      expect.objectContaining({
        color: V.colors.mutedFg,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
      }),
    );
  });

  it('renders a reusable actions column when row actions are provided', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListTableComposition
          columns={columns}
          footer={null}
          getRowKey={row => row.id}
          renderActions={() => <Text>Aksi</Text>}
          rows={[{amount: 'Rp1.000', id: 'row-1', name: 'Laptop'}]}
        />,
      );
    });

    const textValues = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);

    expect(textValues).toContain('Aksi');
  });

  it('renders the compact empty state using the same table frame', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListTableComposition
          columns={columns}
          emptyTitle="Belum ada aset"
          footer={null}
          getRowKey={row => row.id}
          rows={[]}
        />,
      );
    });

    const empty = renderer!.root.findByType(KolamEmptyState);
    expect(empty.props.compact).toBe(true);
    expect(empty.props.title).toBe('Belum ada aset');
  });

  it('uses Memuat... for the loading empty state', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListTableComposition
          columns={columns}
          footer={null}
          getRowKey={row => row.id}
          loading
          rows={[]}
        />,
      );
    });

    expect(renderer!.root.findByType(KolamEmptyState).props.title).toBe(
      'Memuat...',
    );
  });

  it('renders the reusable pagination footer pattern', async () => {
    const onPageChange = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListTablePaginationFooter
          onPageChange={onPageChange}
          page={3}
          pageSize={10}
          total={320}
        />,
      );
    });

    const textValues = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);

    const flattenedText = textValues.flat(4);

    expect(textValues).toEqual(
      expect.arrayContaining([1, 2, 3, '...', 32]),
    );
    expect(flattenedText).toEqual(expect.arrayContaining([21, '-', 30, 320]));
    expect(textValues).not.toContain(4);
    expect(renderer!.root.findAllByType(Path).length).toBeGreaterThan(0);

    const page32 = renderer!.root
      .findAllByProps({accessibilityLabel: 'Halaman 32'})
      .find(node => typeof node.props.onPress === 'function');
    page32!.props.onPress();
    expect(onPageChange).toHaveBeenCalledWith(32);
  });

  it('uses real SVG triangle icons for pagination navigation buttons', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamListTablePaginationFooter
          onPageChange={jest.fn()}
          page={1}
          pageSize={10}
          total={25}
        />,
      );
    });

    const firstButton = renderer!.root.findByProps({
      accessibilityLabel: 'Halaman pertama',
    });
    const previousButton = renderer!.root.findByProps({
      accessibilityLabel: 'Halaman sebelumnya',
    });
    const nextButton = renderer!.root.findByProps({
      accessibilityLabel: 'Halaman berikutnya',
    });
    const lastButton = renderer!.root.findByProps({
      accessibilityLabel: 'Halaman terakhir',
    });

    expect(firstButton.props.disabled).toBe(true);
    expect(previousButton.props.disabled).toBe(true);
    expect(nextButton.props.disabled).toBe(false);
    expect(lastButton.props.disabled).toBe(false);
    expect(renderer!.root.findAllByType(Path).length).toBeGreaterThanOrEqual(6);
  });
});
