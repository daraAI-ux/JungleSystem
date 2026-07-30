import {
  applyKolamAdaptiveColumnWidths,
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
} from '../src/domain/kolam-table';

describe('getKolamTableColumns', () => {
  it('defines brand table headers for logo identity, country flag, and backend counts', () => {
    expect(getKolamTableColumns('brand').map(column => column.label)).toEqual([
      'Merek',
      'Negara',
      'Produk',
      'Bahan',
      'Catatan',
      'Status',
      '',
    ]);
  });

  it('defines live-style table headers for catalog, customer, and sales surfaces', () => {
    expect(
      getKolamTableColumns('category').map(column => column.label),
    ).toEqual([
      'Kategori',
      'Subkategori',
      'Produk',
      'Species',
      'Marketplace',
      '',
    ]);
    expect(getKolamTableColumns('catalog').map(column => column.label)).toEqual(
      ['Catalog', 'Stock', 'Price'],
    );
    expect(
      getKolamTableColumns('customer').map(column => column.label),
    ).toEqual(['Customer', 'Phone', 'Email']);
    expect(getKolamTableColumns('sales').map(column => column.label)).toEqual([
      'Sale',
      'Status',
      'Total',
      'Actions',
    ]);
  });

  it('defines supplier catalog purchase table headers', () => {
    expect(
      getKolamTableColumns('supplier-catalog').map(column => column.label),
    ).toEqual([
      'Nama',
      'Harga',
      'Total order',
      'Total value order',
      'Terakhir purchase',
    ]);
  });

  it('defines purchase order list table headers', () => {
    expect(
      getKolamTableColumns('purchase-order').map(column => column.label),
    ).toEqual([
      'Kode PO',
      'Pemasok',
      'Total Item',
      'Total Biaya',
      'Status',
      'Dibuat',
      '',
    ]);
  });

  it('defines production list table headers matching FE', () => {
    expect(getKolamTableColumns('production').map(column => column.label)).toEqual([
      'Target',
      'Varian',
      'Kemajuan',
      'Est. Biaya',
      'Batch ID',
      'Status',
      'PIC',
      'Tanggal',
      '',
    ]);
  });

  it('sizes secondary columns from the longest field value within min/max bounds', () => {
    const columns = applyKolamAdaptiveColumnWidths(getKolamTableColumns('production'), [
      {
        id: 'notes',
        values: ['PRD-SHORT', 'PRD-20260703080531-VERY-LONG-BATCH'],
        minWidth: 120,
        maxWidth: 260,
        charWidth: 8.5,
        padding: 32,
      },
      {
        id: 'products',
        values: ['••'],
        minWidth: 56,
        maxWidth: 72,
        padding: 16,
      },
    ]);

    const batch = columns.find(column => column.id === 'notes');
    const pic = columns.find(column => column.id === 'products');
    const primary = columns.find(column => column.id === 'primary');

    expect(primary?.width).toBeUndefined();
    expect(batch?.width).toBeGreaterThanOrEqual(120);
    expect(batch?.width).toBeLessThanOrEqual(260);
    expect(batch?.width).toBeGreaterThan(140);
    expect(pic?.width).toBeGreaterThanOrEqual(56);
    expect(pic?.width).toBeLessThanOrEqual(72);
  });

  it('fits preferred column widths into the measured container without dropping actions', () => {
    const preferred = applyKolamAdaptiveColumnWidths(getKolamTableColumns('production'), [
      {
        id: 'notes',
        values: ['PRD-20260703080531-VERY-LONG-BATCH'],
        minWidth: 120,
        maxWidth: 280,
        charWidth: 9,
      },
      {
        id: 'amount',
        values: ['Rp 1.234.567'],
        minWidth: 100,
        maxWidth: 180,
      },
      {
        id: 'actions',
        values: ['...'],
        minWidth: 64,
        maxWidth: 64,
        padding: 0,
      },
    ]);

    const fitted = fitKolamDataTableColumns(preferred, 900, {
      actionsMinWidth: 64,
      gap: 16,
      paddingX: 40,
      primaryMinWidth: 180,
      secondaryMinWidth: 48,
    });

    const actions = fitted.find(column => column.id === 'actions');
    const primary = fitted.find(column => column.id === 'primary');
    const secondaryTotal = fitted.reduce((sum, column) => {
      if (column.id === 'primary' || column.id === 'actions') {
        return sum;
      }
      return sum + (column.width ?? 0);
    }, 0);

    expect(primary?.width).toBeUndefined();
    expect(actions?.width).toBe(64);
    expect(secondaryTotal + 64 + 180).toBeLessThanOrEqual(900 - 40 - 16 * 8);
  });

  it('defines product serial list table headers matching FE', () => {
    expect(getKolamTableColumns('product-serial').map(column => column.label)).toEqual([
      'Nomor Seri',
      'Produk',
      'Tipe',
      'Batch',
      'Tanggal Produksi',
      'Status',
      'Opname',
      '',
    ]);
  });

  it('defines purchase order item table headers in Indonesian', () => {
    expect(
      getKolamTableColumns('purchase-order-items').map(column => column.label),
    ).toEqual([
      'Produk',
      'SKU / Kode',
      'Varian',
      'Jumlah',
      'Satuan',
      'Harga Satuan',
      'Diterima',
      'Total',
    ]);
    expect(
      getKolamTableColumns('purchase-order-form-items').map(
        column => column.label,
      ),
    ).toEqual([
      'Produk',
      'SKU / Kode',
      'Varian',
      'Jumlah',
      'Satuan',
      'Harga Satuan',
      'Total',
      '',
    ]);
  });

  it('returns cloned column definitions so render code cannot mutate the contract', () => {
    const first = getKolamTableColumns('sales');
    first[0].label = 'Changed';

    expect(getKolamTableColumns('sales')[0].label).toBe('Sale');
  });

  it('keeps the native table wrapper aligned with the live Kolam Table component', () => {
    const contract = getKolamTableVisualContract();

    expect(contract.sourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\table.tsx',
    );
    expect(contract.wrapper).toEqual({
      card: true,
      overflowHidden: true,
      overflowX: true,
      whitespaceNoWrap: true,
      cardSpacing: 0,
    });
    expect(contract.root).toEqual({
      minWidth: '100%',
      captionSide: 'bottom',
      fontSize: 14,
      lineHeight: 24,
    });
    expect(contract.header).toEqual({
      background: 'secondary/50',
      resolvedBackground: '#f2f3f5',
      borderY: true,
      columnPaddingX: 20,
      gutterY: 12,
      fontSize: 14,
      lineHeight: 24,
      fontWeight: 'medium',
    });
    expect(contract.body).toEqual({
      emptyStateHeight: 288,
      rowMinHeight: 52,
      rowBorderBottom: true,
      lastRowBorderBottom: false,
      cellPaddingX: 20,
      gutterY: 12,
      primaryWeight: 'semibold',
      amountWeight: 'semibold',
    });
    expect(contract.interaction).toEqual({
      selectedBackground: 'secondary/50',
      resolvedSelectedBackground: '#f2f3f5',
      selectedText: 'fg',
      hoverBackground: 'secondary/50',
      disabledOpacity: 0.5,
    });
    expect(contract.body.rowMinHeight).toBe(52);
    expect(contract.body.emptyStateHeight).toBe(288);
  });
});
