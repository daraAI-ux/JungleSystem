export type KolamTableId =
  | 'brand'
  | 'catalog'
  | 'category'
  | 'custom-field'
  | 'customer'
  | 'iucn-status'
  | 'sales'
  | 'tag'
  | 'taxonomy'
  | 'unit';

export interface KolamTableColumn {
  id:
    | 'primary'
    | 'meta'
    | 'amount'
    | 'children'
    | 'marketplace'
    | 'products'
    | 'raws'
    | 'notes'
    | 'status'
    | 'actions';
  label: string;
  align: 'left' | 'right';
  width?: number;
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
    { id: 'children', label: 'Subkategori', align: 'left', width: 132 },
    { id: 'products', label: 'Produk', align: 'right', width: 92 },
    { id: 'meta', label: 'Species', align: 'right', width: 92 },
    { id: 'marketplace', label: 'Marketplace', align: 'left', width: 132 },
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
    { id: 'primary', label: 'Customer', align: 'left' },
    { id: 'meta', label: 'Phone', align: 'left', width: 150 },
    { id: 'amount', label: 'Email', align: 'right', width: 170 },
  ],
  'iucn-status': [
    { id: 'meta', label: 'Gambar', align: 'left', width: 72 },
    { id: 'children', label: 'Singkatan', align: 'left', width: 118 },
    { id: 'primary', label: 'Nama', align: 'left' },
    { id: 'amount', label: 'Urutan', align: 'right', width: 90 },
    { id: 'status', label: 'Status', align: 'right', width: 116 },
    { id: 'actions', label: '', align: 'right', width: 64 },
  ],  taxonomy: [
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
  return kolamTableColumns[tableId].map(column => ({ ...column }));
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


