export type KolamTableId =
  | 'brand'
  | 'catalog'
  | 'category'
  | 'custom-field'
  | 'customer'
  | 'iucn-status'
  | 'location'
  | 'location-asset'
  | 'location-enclosure'
  | 'location-product'
  | 'packing-material'
  | 'production'
  | 'production-materials'
  | 'purchase-order'
  | 'purchase-order-items'
  | 'purchase-order-form-items'
  | 'sales'
  | 'species'
  | 'supplier'
  | 'supplier-catalog'
  | 'tag'
  | 'teranura'
  | 'taxonomy'
  | 'unit';

export type KolamTableColumnAlign = 'center' | 'left' | 'right';

export interface KolamTableColumn {
  id:
    | 'primary'
    | 'meta'
    | 'amount'
    | 'children'
    | 'marketplace'
    | 'price'
    | 'products'
    | 'raws'
    | 'notes'
    | 'status'
    | 'actions';
  label: string;
  align: Exclude<KolamTableColumnAlign, 'center'>;
  headerAlign?: KolamTableColumnAlign;
  width?: number;
}

export type KolamTableColumnWidthMap = Partial<
  Record<KolamTableColumn['id'], number>
>;

export interface KolamTableColumnSizing {
  id: KolamTableColumn['id'];
  values?: Array<number | string | null | undefined>;
  minWidth: number;
  maxWidth: number;
  charWidth?: number;
  padding?: number;
}

export interface KolamTableVisualContract {
  sourceComponent: string;
  wrapper: {
    card: true;
    overflowHidden: true;
    overflowX: true;
    whitespaceNoWrap: true;
    cardSpacing: 0;
  };
  root: {
    minWidth: '100%';
    captionSide: 'bottom';
    fontSize: 14;
    lineHeight: 24;
  };
  header: {
    background: 'secondary/50';
    resolvedBackground: '#f2f3f5';
    borderY: true;
    columnPaddingX: number;
    gutterY: number;
    fontSize: number;
    lineHeight: number;
    fontWeight: 'medium';
  };
  body: {
    emptyStateHeight: number;
    rowMinHeight: number;
    rowBorderBottom: true;
    lastRowBorderBottom: false;
    cellPaddingX: number;
    gutterY: number;
    primaryWeight: 'semibold';
    amountWeight: 'semibold';
  };
  interaction: {
    selectedBackground: 'secondary/50';
    resolvedSelectedBackground: '#f2f3f5';
    selectedText: 'fg';
    hoverBackground: 'secondary/50';
    disabledOpacity: 0.5;
  };
}

export const kolamTableVisualContract: KolamTableVisualContract = {
  sourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\table.tsx',
  wrapper: {
    card: true,
    overflowHidden: true,
    overflowX: true,
    whitespaceNoWrap: true,
    cardSpacing: 0,
  },
  root: {
    minWidth: '100%',
    captionSide: 'bottom',
    fontSize: 14,
    lineHeight: 24,
  },
  header: {
    background: 'secondary/50',
    resolvedBackground: '#f2f3f5',
    borderY: true,
    columnPaddingX: 20,
    gutterY: 12,
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'medium',
  },
  body: {
    emptyStateHeight: 288,
    rowMinHeight: 52,
    rowBorderBottom: true,
    lastRowBorderBottom: false,
    cellPaddingX: 20,
    gutterY: 12,
    primaryWeight: 'semibold',
    amountWeight: 'semibold',
  },
  interaction: {
    selectedBackground: 'secondary/50',
    resolvedSelectedBackground: '#f2f3f5',
    selectedText: 'fg',
    hoverBackground: 'secondary/50',
    disabledOpacity: 0.5,
  },
};

const kolamTableColumns: Record<KolamTableId, KolamTableColumn[]> = {
  brand: [
    { id: 'primary', label: 'Merek', align: 'left' },
    { id: 'meta', label: 'Negara', align: 'left', width: 96 },
    { id: 'products', label: 'Produk', align: 'right', width: 92 },
    { id: 'raws', label: 'Bahan', align: 'right', width: 92 },
    { id: 'notes', label: 'Catatan', align: 'left', width: 180 },
    { id: 'status', label: 'Status', align: 'right', width: 116 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  catalog: [
    { id: 'primary', label: 'Catalog', align: 'left' },
    { id: 'meta', label: 'Stock', align: 'left', width: 150 },
    { id: 'amount', label: 'Price', align: 'right', width: 170 },
  ],
  category: [
    { id: 'primary', label: 'Kategori', align: 'left' },
    {
      id: 'children',
      label: 'Subkategori',
      align: 'right',
      headerAlign: 'center',
      width: 132,
    },
    {
      id: 'products',
      label: 'Produk',
      align: 'right',
      headerAlign: 'center',
      width: 92,
    },
    {
      id: 'meta',
      label: 'Species',
      align: 'right',
      headerAlign: 'center',
      width: 92,
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      align: 'right',
      headerAlign: 'center',
      width: 132,
    },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  tag: [
    { id: 'primary', label: 'Tag', align: 'left' },
    { id: 'meta', label: 'Warna', align: 'left', width: 96 },
    { id: 'notes', label: 'Deskripsi', align: 'left', width: 320 },
    { id: 'amount', label: 'Digunakan', align: 'right', width: 112 },
    { id: 'status', label: 'Status', align: 'right', width: 116 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  'custom-field': [
    { id: 'primary', label: 'Label', align: 'left' },
    { id: 'meta', label: 'Kunci', align: 'left', width: 150 },
    { id: 'notes', label: 'Tipe', align: 'left', width: 110 },
    { id: 'children', label: 'Aturan', align: 'left', width: 230 },
    { id: 'amount', label: 'Urutan', align: 'right', width: 86 },
    { id: 'status', label: 'Status', align: 'right', width: 116 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  customer: [
    { id: 'primary', label: 'Pelanggan', align: 'left' },
    { id: 'meta', label: 'Phone', align: 'left', width: 150 },
    { id: 'amount', label: 'Email', align: 'right', width: 170 },
  ],
  'packing-material': [
    { id: 'meta', label: 'Foto', align: 'left', width: 72 },
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'children', label: 'Kategori', align: 'left', width: 120 },
    { id: 'notes', label: 'Dimensi', align: 'left', width: 128 },
    { id: 'marketplace', label: 'Berat', align: 'left', width: 96 },
    { id: 'amount', label: 'HPP', align: 'right', width: 116 },
    { id: 'raws', label: 'Stok', align: 'right', width: 72 },
    { id: 'status', label: 'Status', align: 'right', width: 104 },
    { id: 'actions', label: 'Aksi', align: 'right', width: 56 },
  ],
  'iucn-status': [
    { id: 'meta', label: 'Gambar', align: 'left', width: 72 },
    { id: 'children', label: 'Singkatan', align: 'left', width: 118 },
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'amount', label: 'Urutan', align: 'right', width: 90 },
    { id: 'status', label: 'Status', align: 'right', width: 116 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  location: [
    { id: 'primary', label: 'Nama Lokasi', align: 'left', width: 220 },
    { id: 'meta', label: 'Tipe', align: 'left', width: 112 },
    { id: 'children', label: 'Tingkat', align: 'left', width: 104 },
    { id: 'notes', label: 'Induk', align: 'left', width: 156 },
    { id: 'marketplace', label: 'Telepon', align: 'left', width: 132 },
    { id: 'status', label: 'Deskripsi', align: 'left', width: 220 },
    { id: 'amount', label: 'Dibuat', align: 'right', width: 128 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  'location-product': [
    { id: 'meta', label: '', align: 'left', width: 64 },
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'children', label: 'SKU', align: 'left', width: 118 },
    { id: 'amount', label: 'Stok', align: 'right', width: 90 },
    { id: 'status', label: 'Status', align: 'left', width: 126 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  'location-enclosure': [
    { id: 'meta', label: '', align: 'left', width: 64 },
    { id: 'children', label: 'Kode', align: 'left', width: 104 },
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'notes', label: 'Tipe', align: 'left', width: 120 },
    { id: 'marketplace', label: 'PIC', align: 'left', width: 140 },
    { id: 'status', label: 'Status', align: 'left', width: 126 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  'location-asset': [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'meta', label: 'Kode', align: 'left', width: 126 },
    { id: 'status', label: 'Status', align: 'left', width: 126 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  species: [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'meta', label: 'SKU', align: 'left', width: 126 },
    { id: 'amount', label: 'Harga Jual', align: 'right', width: 140 },
    { id: 'children', label: 'Stok', align: 'right', width: 110 },
    { id: 'marketplace', label: 'Sinkron Terakhir', align: 'left', width: 168 },
    { id: 'notes', label: 'Informasi', align: 'right', width: 136 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  supplier: [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'meta', label: 'Telepon', align: 'left', width: 140 },
    { id: 'notes', label: 'Email', align: 'left', width: 180 },
    { id: 'children', label: 'Total PO', align: 'right', width: 100 },
    { id: 'status', label: 'Status', align: 'left', width: 120 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  'supplier-catalog': [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'price', label: 'Harga', align: 'right', width: 120 },
    { id: 'children', label: 'Total order', align: 'right', width: 110 },
    { id: 'amount', label: 'Total value order', align: 'right', width: 140 },
    { id: 'notes', label: 'Terakhir purchase', align: 'left', width: 140 },
  ],
  production: [
    { id: 'primary', label: 'Target', align: 'left' },
    { id: 'meta', label: 'Varian', align: 'left', width: 140 },
    { id: 'children', label: 'Kemajuan', align: 'left', width: 100 },
    { id: 'amount', label: 'Est. Biaya', align: 'right', width: 120 },
    { id: 'notes', label: 'Batch ID', align: 'left', width: 140 },
    { id: 'status', label: 'Status', align: 'left', width: 120 },
    { id: 'products', label: 'PIC', align: 'center', headerAlign: 'center', width: 56 },
    { id: 'marketplace', label: 'Tanggal Produksi', align: 'left', width: 120 },
    { id: 'actions', label: '', align: 'right', width: 48 },
  ],
  'production-materials': [
    { id: 'primary', label: 'Komponen', align: 'left' },
    { id: 'meta', label: 'Varian', align: 'left', width: 120 },
    { id: 'notes', label: 'SKU / Kode', align: 'left', width: 120 },
    { id: 'products', label: 'Satuan', align: 'left', width: 80 },
    { id: 'children', label: 'Qty Dibutuhkan', align: 'right', width: 100 },
    { id: 'raws', label: 'Stok Tersedia', align: 'right', width: 100 },
    { id: 'status', label: 'Kecukupan', align: 'right', width: 100 },
    { id: 'price', label: 'Harga / Satuan', align: 'right', width: 120 },
    { id: 'amount', label: 'Subtotal', align: 'right', width: 130 },
  ],
  'purchase-order': [
    { id: 'primary', label: 'Kode PO', align: 'left' },
    { id: 'meta', label: 'Pemasok', align: 'left', width: 180 },
    { id: 'children', label: 'Total Item', align: 'right', width: 100 },
    { id: 'amount', label: 'Total Biaya', align: 'right', width: 140 },
    { id: 'status', label: 'Status', align: 'right', width: 120 },
    { id: 'marketplace', label: 'Dibuat', align: 'left', width: 140 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  'purchase-order-items': [
    { id: 'primary', label: 'Produk', align: 'left' },
    { id: 'meta', label: 'SKU / Kode', align: 'left', width: 120 },
    { id: 'notes', label: 'Varian', align: 'left', width: 120 },
    { id: 'children', label: 'Jumlah', align: 'right', width: 80 },
    { id: 'products', label: 'Satuan', align: 'left', width: 80 },
    { id: 'price', label: 'Harga Satuan', align: 'right', width: 120 },
    { id: 'raws', label: 'Diterima', align: 'right', width: 90 },
    { id: 'amount', label: 'Total', align: 'right', width: 130 },
  ],
  'purchase-order-form-items': [
    { id: 'primary', label: 'Produk', align: 'left' },
    { id: 'meta', label: 'SKU / Kode', align: 'left', width: 110 },
    { id: 'notes', label: 'Varian', align: 'left', width: 110 },
    { id: 'children', label: 'Jumlah', align: 'right', width: 90 },
    { id: 'products', label: 'Satuan', align: 'left', width: 80 },
    { id: 'price', label: 'Harga Satuan', align: 'right', width: 120 },
    { id: 'amount', label: 'Total', align: 'right', width: 120 },
    { id: 'actions', label: '', align: 'right', width: 72 },
  ],
  teranura: [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'meta', label: 'SKU', align: 'left', width: 118 },
    { id: 'price', label: 'Merek', align: 'left', width: 130 },
    { id: 'children', label: 'Varian', align: 'left', width: 112 },
    { id: 'amount', label: 'Harga Jual', align: 'right', width: 132 },
    { id: 'products', label: 'Stok', align: 'right', width: 104 },
    { id: 'status', label: 'Status', align: 'right', width: 118 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  taxonomy: [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'meta', label: 'Tingkat', align: 'left', width: 120 },
    { id: 'notes', label: 'Nama Ilmiah', align: 'left', width: 180 },
    { id: 'children', label: 'Anak', align: 'right', width: 88 },
    { id: 'marketplace', label: 'Jalur', align: 'left', width: 220 },
    { id: 'status', label: 'Status', align: 'right', width: 116 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  unit: [
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'meta', label: 'Simbol/Inisial', align: 'left', width: 140 },
    { id: 'notes', label: 'Tipe', align: 'left', width: 120 },
    { id: 'children', label: 'Satuan Dasar', align: 'left', width: 116 },
    { id: 'status', label: 'Status', align: 'right', width: 116 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],
  sales: [
    { id: 'primary', label: 'Sale', align: 'left' },
    { id: 'meta', label: 'Status', align: 'left', width: 92 },
    { id: 'amount', label: 'Total', align: 'right', width: 150 },
    { id: 'actions', label: 'Actions', align: 'right', width: 180 },
  ],
};

export function getKolamTableColumns(
  tableId: KolamTableId,
): KolamTableColumn[] {
  const columns = kolamTableColumns[tableId];
  if (!columns) {
    throw new Error(`Unknown Kolam table columns for "${tableId}"`);
  }
  return columns.map(column => ({ ...column }));
}

export function applyKolamAdaptiveColumnWidths(
  columns: KolamTableColumn[],
  sizing: KolamTableColumnSizing[],
): KolamTableColumn[] {
  const sizingById = new Map(sizing.map(item => [item.id, item]));

  return columns.map(column => {
    const columnSizing = sizingById.get(column.id);

    if (!columnSizing) {
      return { ...column };
    }

    return {
      ...column,
      width: getKolamAdaptiveColumnWidth(column.label, columnSizing),
    };
  });
}

export function getKolamTableColumnWidthMap(
  columns: KolamTableColumn[],
): KolamTableColumnWidthMap {
  return columns.reduce<KolamTableColumnWidthMap>((widths, column) => {
    if (typeof column.width === 'number') {
      widths[column.id] = column.width;
    }

    return widths;
  }, {});
}

export function getKolamTableVisualContract(): KolamTableVisualContract {
  return {
    ...kolamTableVisualContract,
    wrapper: { ...kolamTableVisualContract.wrapper },
    root: { ...kolamTableVisualContract.root },
    header: { ...kolamTableVisualContract.header },
    body: { ...kolamTableVisualContract.body },
    interaction: { ...kolamTableVisualContract.interaction },
  };
}

function getKolamAdaptiveColumnWidth(
  label: string,
  sizing: KolamTableColumnSizing,
) {
  const values: Array<number | string | null | undefined> = [
    label,
    ...(sizing.values ?? []),
  ];
  const maxLength = values.reduce<number>(
    (length, value) =>
      Math.max(length, stringifyKolamColumnValue(value).length),
    0,
  );
  const charWidth = sizing.charWidth ?? 8;
  const padding = sizing.padding ?? 28;
  const preferredWidth = Math.ceil(maxLength * charWidth + padding);

  return Math.min(
    sizing.maxWidth,
    Math.max(sizing.minWidth, preferredWidth),
  );
}

function stringifyKolamColumnValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}
